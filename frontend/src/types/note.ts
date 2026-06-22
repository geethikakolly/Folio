export interface Note {
  id: string
  notebookId: string
  userId: string
  title: string
  content: string
  markdownContent?: string
  isPinned: boolean
  isArchived: boolean
  version: number
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface CreateNoteRequest {
  notebookId: string
  title: string
  content: string
  markdownContent?: string
}

export interface UpdateNoteRequest {
  title?: string
  content?: string
  markdownContent?: string
  isPinned?: boolean
  isArchived?: boolean
}
