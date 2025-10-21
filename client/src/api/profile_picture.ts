import { apiClient } from './client';

export interface ProfilePictureUploadRequest {
    image: File;
}

export interface ProfilePictureUploadResponse {
    message?: string;
    error?: string;
    success: boolean;
    image_url?: string;
}

export const UploadProfilePicture = async (data: ProfilePictureUploadRequest): Promise<ProfilePictureUploadResponse> => {
    const formData = new FormData();
    formData.append('profile_image', data.image);
    const response = await apiClient.post<ProfilePictureUploadResponse>(`/users/profile-picture`, formData, {
        headers: { 
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
    });
    return response.data;
}