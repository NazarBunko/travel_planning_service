import React, { FC } from 'react';
import Button from '../../components/UI/Button.tsx';
import TripPlaceCard from '../../components/Trip/TripPlaceCard.tsx';
import Modal from '../../components/UI/Modal.tsx';
import useTripPage, { TripPageHook } from '../../hooks/useTripPage.ts';
import TripEditForm from '../../components/Modal/TripForm.tsx';
import PlaceEditForm from '../../components/Modal/PlaceForm.tsx';
import CollaborationForm from '../../components/Modal/CollaborationForm.tsx';

const TripPage: FC = () => {
    const { 
        trip, 
        currentUser, 
        isLoading, 
        isOwnerOrCollaborator, 
        placesByDay, 
        dayNumbers, 
        formatUserList, 
        handleDelete: handleDeletePlace,
        handleEditPlaceView,
        placeToEdit,
        isTripModalOpen,
        handleOpenTripModal,
        handleCloseTripModal,
        isPlaceModalOpen,
        handleOpenPlaceModal,
        handleClosePlaceModal,
        isCollabModalOpen,
        handleOpenCollabModal,
        handleCloseCollabModal,
        loadTripData,
        handleDeleteTrip,
    }: TripPageHook = useTripPage();

    if (isLoading) {
        return <div className="text-center mt-12">Завантаження...</div>;
    }

    if (!currentUser || !trip) {
        return <div className="text-center mt-12 text-red-600">Доступ заборонено або поїздку не знайдено.</div>;
    }
    
    const formattedStartDate = trip.startDate 
        ? new Date(trip.startDate).toLocaleDateString('uk-UA') 
        : 'Н/Д';
    const formattedEndDate = trip.endDate 
        ? new Date(trip.endDate).toLocaleDateString('uk-UA') 
        : 'Н/Д';


    return (
        <div className="container mx-auto p-4">
            
            <Modal
                isOpen={isTripModalOpen}
                onClose={handleCloseTripModal}
                title={`Редагування подорожі: ${trip.title}`}
            >
                <TripEditForm
                    trip={trip}
                    onClose={handleCloseTripModal}
                    onUpdate={loadTripData}
                />
            </Modal>

            <Modal
                isOpen={isPlaceModalOpen}
                onClose={handleClosePlaceModal}
                title={placeToEdit ? `Редагування місця: ${placeToEdit.locationName}` : 'Додавання нового місця'}
            >
                {trip && (
                    <PlaceEditForm
                        tripId={trip.id}
                        placeToEdit={placeToEdit}
                        onClose={handleClosePlaceModal}
                        onUpdate={loadTripData}
                    />
                )}
            </Modal>

            <Modal
                isOpen={isCollabModalOpen}
                onClose={handleCloseCollabModal}
                title="Додати Учасника/Співавтора"
            >
                {trip && (
                    <CollaborationForm
                        tripId={trip.id}
                        onClose={handleCloseCollabModal}
                        onUpdate={loadTripData}
                    />
                )}
            </Modal>

            <h1 className="text-3xl font-bold text-center mb-2">{trip.title}</h1>
            <p className="text-gray-600 text-center">{trip.description}</p>

            <div className="mb-8">
                <p className="text-gray-600 text-center">
                    Головний організатор: <span className="font-semibold">{formatUserList([trip.ownerId])}</span>
                </p>
                <p className="text-gray-600 text-center">
                    Співавтори: <span className="font-semibold">{formatUserList(trip.collaboratorIds)}</span>
                </p>
                <p className="text-gray-600 text-center">
                    Туристи: <span className="font-semibold">{formatUserList(trip.memberIds)}</span>
                </p>
                <p className="text-gray-600 text-center">
                    Час: <span className="font-semibold">{formattedStartDate} - {formattedEndDate}</span>
                </p>
            </div>

            <div className="flex justify-center mb-10">
                <div className="flex space-x-4">
                    {isOwnerOrCollaborator && (
                        <>
                            <Button 
                                className="w-[200px] py-2 px-3 bg-green-500 hover:bg-green-600 text-white text-sm 
                                           focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                onClick={handleOpenPlaceModal}
                            >
                                Додати місце
                            </Button>
                            
                            <Button 
                                className="w-[200px] py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm 
                                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                onClick={handleOpenCollabModal}
                            >
                                Редагувати учасників
                            </Button>
                            
                            <Button 
                                onClick={handleOpenTripModal}
                                className="w-[200px] py-2 px-3 bg-orange-600 hover:bg-orange-700 text-white text-sm 
                                           focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                            >
                                Редагувати
                            </Button>
                            
                            <Button 
                                onClick={handleDeleteTrip}
                                className="w-[200px] py-2 px-3 bg-red-600 hover:bg-red-700 text-white text-sm 
                                           focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                                Видалити
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-5 text-gray-800 border-t pt-5">План Подорожі</h2>
            
            {dayNumbers.length === 0 ? (
                <p className="text-center text-gray-500">Маршрут ще не заплановано.</p>
            ) : (
                <div className="space-y-8">
                    {dayNumbers.map(dayNumber => (
                        <div key={dayNumber} className="border p-4 rounded-lg bg-gray-50">
                            <h3 className="text-xl font-semibold mb-3 text-blue-700">
                                День {dayNumber}
                            </h3>
                            <div className="space-y-3">
                                {placesByDay.get(dayNumber)?.map(place => (
                                    <TripPlaceCard 
                                        key={place.id} 
                                        place={place}
                                        canManage={isOwnerOrCollaborator}
                                        onDelete={handleDeletePlace}
                                        onEdit={handleEditPlaceView}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default TripPage;