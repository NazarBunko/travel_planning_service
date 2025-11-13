import React, { FC } from 'react';
import Input from '../UI/Input.tsx';
import Button from '../UI/Button.tsx';
import useCollaborationForm from '../../hooks/useCollaborationForm.ts';

interface CollaborationFormProps {
    tripId: string;
    onClose: () => void;
    onUpdate: () => void;
}

const CollaborationForm: FC<CollaborationFormProps> = ({ tripId, onClose, onUpdate }) => {
    
    const { 
        formData, 
        statusMessage, 
        handleInputChange, 
        handleSelectChange, 
        handleSubmit 
    } = useCollaborationForm(tripId, onUpdate, { email: '', role: 'member' });

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Додати Учасника/Співавтора</h2>
            
            <Input
                type="email"
                name="email"
                placeholder="Email користувача"
                value={formData.email}
                onChange={handleInputChange}
                required
            />
            
            <div className="flex items-center space-x-4">
                <label className="text-gray-600">Роль:</label>
                <select
                    name="role"
                    value={formData.role}
                    onChange={handleSelectChange}
                    className="p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="member">Турист (Перегляд)</option>
                    <option value="collaborator">Співавтор (Керування місцями)</option>
                    <option value="delete">Видалити</option>
                </select>
            </div>
            
            {statusMessage && (
                <p className={`text-sm ${statusMessage.startsWith('Помилка') ? 'text-red-500' : 'text-green-600'}`}>
                    {statusMessage}
                </p>
            )}

            <div className="pt-2 flex space-x-3">
                <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                >
                    Зберегти
                </Button>
                <Button 
                    type="button" 
                    onClick={onClose}
                    className="w-full bg-gray-500 hover:bg-gray-600"
                >
                    Закрити
                </Button>
            </div>
        </form>
    );
};

export default CollaborationForm;