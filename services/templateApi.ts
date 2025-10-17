import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Template {
  id: string;
  name: string;
  thumbnail?: string;
  size?: any;
  elements: any;
  objects?: any;
  background?: any;
  fabricJSON?: any;
  json?: any;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserTemplate {
  id: string;
  userId: string;
  baseTemplateId?: string;
  name: string;
  thumbnail?: string;
  category?: string;
  size?: any;
  elements: any;
  objects?: any;
  background?: any;
  fabricJSON?: any;
  json?: any;
  baseTemplate?: Template;
  createdAt: string;
  updatedAt: string;
}

class TemplateApiService {
  private baseUrl = API_BASE_URL;
  private token: string | null = null;

  // Set auth token
  setToken(token: string) {
    this.token = token;
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
    };
  }

  // ==================== ADMIN TEMPLATES (Public) ====================

  // Get all admin templates (available to all users)
  async getAllTemplates(): Promise<Template[]> {
    const response = await axios.get<Template[]>(`${this.baseUrl}/templates`);
    return response.data;
  }

  // Get single admin template
  async getTemplateById(id: string): Promise<Template> {
    const response = await axios.get<Template>(`${this.baseUrl}/templates/${id}`);
    return response.data;
  }

  // ADMIN ONLY: Create template
  async createTemplate(payload: {
    name: string;
    thumbnail?: string;
    size?: any;
    elements: any;
  }): Promise<Template> {
    const response = await axios.post<Template>(
      `${this.baseUrl}/templates`,
      payload,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  // ADMIN ONLY: Update template
  async updateTemplate(id: string, updates: Partial<Template>): Promise<Template> {
    const response = await axios.put<Template>(
      `${this.baseUrl}/templates/${id}`,
      updates,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  // ADMIN ONLY: Delete template
  async deleteTemplate(id: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/templates/${id}`, {
      headers: this.getHeaders(),
    });
  }

  // ==================== USER TEMPLATES (My Projects) ====================

  // Get user's saved templates (My Projects)
  async getMyTemplates(): Promise<UserTemplate[]> {
    const response = await axios.get<UserTemplate[]>(
      `${this.baseUrl}/user-templates/me`,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  // Get single user template
  async getUserTemplate(id: string): Promise<UserTemplate> {
    const response = await axios.get<UserTemplate>(
      `${this.baseUrl}/user-templates/${id}`,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  // Copy admin template to user's workspace
  async copyTemplateToMyProjects(templateId: string): Promise<UserTemplate> {
    const response = await axios.post<UserTemplate>(
      `${this.baseUrl}/user-templates/copy/${templateId}`,
      {},
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  // Create new user template
  async createUserTemplate(payload: {
    name: string;
    size?: any;
    elements: any;
    baseTemplateId?: string;
  }): Promise<UserTemplate> {
    const response = await axios.post<UserTemplate>(
      `${this.baseUrl}/user-templates`,
      payload,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  // Update user template
  async updateUserTemplate(
    id: string,
    updates: {
      name?: string;
      size?: any;
      elements?: any;
    }
  ): Promise<UserTemplate> {
    const response = await axios.put<UserTemplate>(
      `${this.baseUrl}/user-templates/${id}`,
      updates,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  // Delete user template
  async deleteUserTemplate(id: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/user-templates/${id}`, {
      headers: this.getHeaders(),
    });
  }

  // Duplicate user template
  async duplicateUserTemplate(id: string): Promise<UserTemplate> {
    const response = await axios.post<UserTemplate>(
      `${this.baseUrl}/user-templates/${id}/duplicate`,
      {},
      { headers: this.getHeaders() }
    );
    return response.data;
  }
}

export const templateApi = new TemplateApiService();