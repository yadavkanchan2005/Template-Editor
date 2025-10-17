import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Media {
  id: string;
  filename: string;
  url: string;
  type: 'image' | 'shape' | 'svg' | 'json' | 'Stickers' | 'VIDEO';
  createdAt: string;
  uploadedBy: string;
  uploader: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface UploadMediaPayload {
  file: File;
  type: Media['type'];
  uploadedBy: string;
  category?: string; // <-- Add this if you use category
}

export interface AddUrlPayload {
  url: string;
  type: Media['type'];
  uploadedBy: string;
  category?: string; // <-- Add this if you use category
}

class MediaApiService {
  private baseUrl = `${API_BASE_URL}/media`;

  getMediaUrl(url: string): string {
    if (url.startsWith('http')) {
      return url;
    }
    return `${API_BASE_URL}${url}`;
  }

  async getAllMedia(): Promise<Media[]> {
    const response = await axios.get<Media[]>(this.baseUrl);
    return response.data;
  }

  async getMediaByType(type: Media['type']): Promise<Media[]> {
    const response = await axios.get<Media[]>(`${this.baseUrl}?type=${type}`);
    return response.data;
  }

  async getMediaById(id: string): Promise<Media> {
    const response = await axios.get<Media>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // ✅ Accept config for headers/progress
  async uploadFile(
    payload: UploadMediaPayload,
    config?: any
  ): Promise<Media> {
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('type', payload.type);
    formData.append('uploadedBy', payload.uploadedBy);
    if (payload.category) formData.append('category', payload.category);

    const response = await axios.post<Media>(`${this.baseUrl}/upload`, formData, config);
    return response.data;
  }

  // ✅ Accept config for headers
  async addMediaByUrl(
    payload: AddUrlPayload,
    config?: any
  ): Promise<Media> {
    const response = await axios.post<Media>(`${this.baseUrl}/add-url`, payload, config);
    return response.data;
  }

  async deleteMedia(id: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/${id}`);
  }
}

export const mediaApi = new MediaApiService();