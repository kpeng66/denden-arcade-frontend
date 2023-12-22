"use client"

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

interface User {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  }

const RoomLobby: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const room_code = params.room_code;
    const authToken = Cookies.get('authToken');

    const [ws, setWs] = useState<WebSocket | null>(null);

    const [users, setUsers] = useState<User[]>([]);
    const [hostId, setHostId] = useState<number| null>(null);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [currentUserIsHost, setCurrentUserIsHost] = useState<boolean>(false);

    useEffect(() => {
        if (room_code) {
            fetchUsersInRoom();
        }

        const wsConnection = new WebSocket(`ws://127.0.0.1:8000/ws/room/${room_code}`);
        setWs(wsConnection);

        wsConnection.onerror = (error) => {
            console.error("WebSocket Error", error);
        };

        wsConnection.onmessage = (event) => {
            console.log("ws message sent")
            const message = JSON.parse(event.data);
            switch (message.type) {
                case 'game.redirect':
                    router.push(`/game/mathgame`);  // Navigate to minigame page
                    break;
                case 'user_update':
                    setUsers(message.users);
                    break;
                case 'room_closed': 
                    alert(message.message);
                    router.push('/');
            }
        };

        return () => {
            console.log("ws closed")
            wsConnection.close();
        }
    }, [room_code]);

    useEffect(() => {
        if (room_code) {
            fetchHostDetails();
            fetchCurrentUser();
            setCurrentUserIsHost(currentUserId === hostId);
        }
    }, [currentUserIsHost, hostId, currentUserId])

    const fetchUsersInRoom = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/list-users-in-room/${room_code}`);
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                console.error('Error fetching users in room:', await response.text());
            }
        } catch (error) {
            console.error('Error fetching users in room:', error);
        }
    };

    const fetchCurrentUser = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/get-current-user`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setCurrentUserId(data.id);
            } else {
                console.error('Error fetching current user Id: ', await response.text());
            }
        } catch (error) {
            console.error('Error fetching current user id: ', error)
        }
    }

    const fetchHostDetails = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/host-details/${room_code}`);
            if (response.ok) {
                const data = await response.json();
                setHostId(data.host_id);
            } else {
                console.error('Error fetching host details: ', await response.text());
            }
        } catch (error) {
            console.error("Error fetching room details: ", error);
        }
    };

    const leaveRoom = async () => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/leave-room', {room_code: room_code}, { 
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                }
            });
            if (response) {
                router.push('/');
            } else {
                console.error('Error leaving room: response');
            }
        } catch (error) {
            console.error('Error leaving room: try');
        }
    };

    const startGame = async () => {
        if (ws) {
            ws.send(JSON.stringify({'type': 'game.redirect', room_code: room_code}))
        }
    }
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-200">
            <div className="bg-white p-6 rounded-xl shadow-2xl max-w-xl w-full">
                <h1 className="text-4xl mb-2 text-center text-blue-600 font-bold">Room Code: {room_code}</h1>
                <div className="border-t border-gray-300 mt-4 py-4">
                    <h2 className="text-2xl mb-4 text-gray-700 font-semibold">Players:</h2>
                    <ul>
                        {users.map((user, index) => (
                            <li key={index} className="mb-2 px-4 py-2 bg-gray-100 rounded-md shadow-sm text-gray-800">{user.username}</li> 
                        ))}
                    </ul>
                </div>

                {currentUserIsHost && (<button className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition ease-in-out duration-200 transform hover:scale-105"
                    onClick={startGame}>
                    Start Game
                    </button>
                )}

                <button className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition ease-in-out duration-200 transform hover:scale-105"
                    onClick={leaveRoom}>Leave Room</button>
            </div>
        </div>
    );
    
}

export default RoomLobby;





