export type BoardObjectType =
  | 'path'
  | 'rectangle'
  | 'circle'
  | 'line'
  | 'arrow'
  | 'text'
  | 'image'
  | 'sticky'
  | 'formula';

export interface BoardObject {
  id: string;
  boardId: string;
  type: BoardObjectType;
  data: Record<string, any>;
  videoTimestamp?: number;
  layerIndex: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Board {
  id: string;
  roomId: string;
  currentPage: number;
  createdAt: Date;
}

export interface CreateBoardObjectRequest {
  type: BoardObjectType;
  data: Record<string, any>;
  videoTimestamp?: number;
}

export interface UpdateBoardObjectRequest {
  data?: Record<string, any>;
  layerIndex?: number;
}
