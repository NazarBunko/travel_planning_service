import React, { FC } from 'react';
import Button from '../../components/UI/Button.tsx';
import TripCard from '../../components/Trip/TripCard.tsx';
import Modal from '../../components/UI/Modal.tsx';
import TripForm from '../../components/Modal/TripForm.tsx';
import useTripList, { TripListHook } from '../../hooks/useTripList.ts';
import { Trip } from '../../services/tripsService.ts';
import { getCurrentUser, UserPublic } from '../../services/authService.ts';

const TripListPage: FC = () => {
    const { 
        trips, 
        isLoading, 
        error, 
        handleDelete, 
        handleShow,
        handleLogout,
        loadTrips,
        isCreateModalOpen,
        handleOpenCreateModal,
        handleCloseCreateModal
    }: TripListHook = useTripList();

    const currentUser: UserPublic | null = getCurrentUser();

    if (isLoading) {
        return <p className="text-center mt-12 text-gray-600 text-lg">Завантаження подорожей...</p>;
    }
    
    if (error) {
        return <p className="text-center mt-12 text-red-600 text-lg">Помилка: {error}</p>;
    }

    return (
        <div>
            <Modal
                isOpen={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                title="Створення нової подорожі"
            >
                <TripForm
                    onClose={handleCloseCreateModal}
                    onUpdate={loadTrips}
                />
            </Modal>
            
            <div className="max-w-[1000px] mx-auto mt-12 p-5">

                <h2 className="text-3xl font-bold mb-2 text-center text-gray-800">Мої Подорожі</h2>

                <h5 className="text-xl font-bold mb-4 text-center text-gray-400">{currentUser?.name} ({currentUser?.role})</h5>
                
                <div className="flex justify-end mb-4">
                    <Button 
                        className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 text-base"
                        onClick={handleOpenCreateModal}
                    >
                        + Створити Подорож
                    </Button>
                </div>

                <div className="space-y-4">
                    {trips.length === 0 ? (
                        <p className="text-center text-gray-500 text-lg">Подорожей не знайдено.</p>
                    ) : (
                        trips.map((trip: Trip) => (
                            <TripCard
                                key={trip.id}
                                trip={trip}
                                onShow={handleShow}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </div>
            </div>

            <div className="flex justify-end max-w-[150px] mx-auto">
                <Button 
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2" 
                    onClick={handleLogout}
                >
                    Вийти
                </Button>
            </div>
        </div>
    );
}

export default TripListPage;