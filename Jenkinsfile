pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    ansiColor('xterm')
  }

  parameters {
    choice(name: 'ENVIRONMENT', choices: ['dev', 'stage', 'prod'], description: 'Terraform target environment')
    string(name: 'TF_VARS_FILE', defaultValue: 'terraform.dev.tfvars', description: 'Terraform variables file in infrastructure/terraform/aws')
    booleanParam(name: 'APPLY', defaultValue: false, description: 'Apply planned changes')
  }

  environment {
    TF_ROOT = 'infrastructure/terraform/aws'
    TF_IN_AUTOMATION = 'true'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Terraform Init') {
      steps {
        sh '''#!/usr/bin/env bash
          set -euo pipefail
          cd "$TF_ROOT"

          BACKEND_FILE="backend-${ENVIRONMENT}.hcl"
          if [[ ! -f "$BACKEND_FILE" ]]; then
            echo "Missing $BACKEND_FILE. Copy from ${BACKEND_FILE}.example and set real values."
            exit 1
          fi

          terraform init -input=false -reconfigure -backend-config="$BACKEND_FILE"
        '''
      }
    }

    stage('Terraform Fmt and Validate') {
      steps {
        sh '''#!/usr/bin/env bash
          set -euo pipefail
          cd "$TF_ROOT"
          terraform fmt -check
          terraform validate
        '''
      }
    }

    stage('Terraform Plan') {
      steps {
        sh '''#!/usr/bin/env bash
          set -euo pipefail
          cd "$TF_ROOT"

          TF_VARS_ARGS=""
          if [[ -f "${TF_VARS_FILE}" ]]; then
            TF_VARS_ARGS="-var-file=${TF_VARS_FILE}"
          else
            echo "Warning: ${TF_VARS_FILE} not found. Planning without explicit var file."
          fi

          terraform plan -input=false -out=tfplan $TF_VARS_ARGS
          terraform show -no-color tfplan > tfplan.txt
        '''
      }
      post {
        always {
          archiveArtifacts artifacts: 'infrastructure/terraform/aws/tfplan.txt', fingerprint: true
        }
      }
    }

    stage('Approval (stage/prod)') {
      when {
        allOf {
          expression { params.APPLY }
          expression { params.ENVIRONMENT != 'dev' }
        }
      }
      steps {
        input message: "Apply Terraform changes to ${params.ENVIRONMENT}?", ok: 'Deploy'
      }
    }

    stage('Terraform Apply') {
      when {
        expression { params.APPLY }
      }
      steps {
        sh '''#!/usr/bin/env bash
          set -euo pipefail
          cd "$TF_ROOT"
          terraform apply -input=false tfplan
        '''
      }
    }
  }

  post {
    always {
      sh '''#!/usr/bin/env bash
        set +e
        cd "$TF_ROOT"
        terraform output -json > tf_outputs.json
      '''
      archiveArtifacts artifacts: 'infrastructure/terraform/aws/tf_outputs.json', allowEmptyArchive: true
    }
  }
}
