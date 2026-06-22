export interface Notebook {
  id: string
  userId: string
  title: string
  description?: string
  color: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface CreateNotebookRequest {
  title: string
  description?: string
  color?: string
}

export interface UpdateNotebookRequest {
  title?: string
  description?: string
  color?: string
}
