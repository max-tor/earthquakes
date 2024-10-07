"use client";

import { useQuery, useMutation, gql } from '@apollo/client';
import client from './apollo-client';
import { useState } from 'react';

const GET_EARTHQUAKES = gql`
  query GetEarthquakes {
    items {
      id
      location
      magnitude
      date
    }
  }
`;

const CREATE_EARTHQUAKE = gql`
  mutation CreateEarthquake($location: String!, $magnitude: Float!, $date: String!) {
    addItem(location: $location, magnitude: $magnitude, date: $date) {
      id
      location
      magnitude
      date
    }
  }
`;

const UPDATE_EARTHQUAKE = gql`
  mutation UpdateEarthquake($id: ID!, $location: String!, $magnitude: Float!, $date: String!) {
    updateItem(id: $id, location: $location, magnitude: $magnitude, date: $date) {
      id
      location
      magnitude
      date
    }
  }
`;

const DELETE_EARTHQUAKE = gql`
  mutation DeleteEarthquake($id: ID!) {
    deleteItem(id: $id) {
      id
      location
      magnitude
      date
    }
  }
`;

export default function Home() {
  const { loading, error, data } = useQuery(GET_EARTHQUAKES, { client });
  const [addItem] = useMutation(CREATE_EARTHQUAKE, { client, refetchQueries: [{ query: GET_EARTHQUAKES }] });
  const [updateItem] = useMutation(UPDATE_EARTHQUAKE, { client, refetchQueries: [{ query: GET_EARTHQUAKES }] });
  const [deleteItem] = useMutation(DELETE_EARTHQUAKE, { client, refetchQueries: [{ query: GET_EARTHQUAKES }] });
  const [location, setLocation] = useState('');
  const [magnitude, setMagnitude] = useState('');
  const [date, setDate] = useState('');
  const [editItemId, setEditItemId] = useState(null);
  const [editLocation, setEditLocation] = useState('');
  const [editMagnitude, setEditMagnitude] = useState('');
  const [editDate, setEditDate] = useState('');

  const handleCreateEarthquake = async (e) => {
    e.preventDefault();
    if (location.trim() === '' || magnitude.trim() === '' || date.trim() === '') return;
    await addItem({ variables: { location, magnitude: parseFloat(magnitude), date } });
    setLocation('');
    setMagnitude('');
    setDate('');
  };

  const handleUpdateEarthquake = async (e) => {
    e.preventDefault();
    if (editLocation.trim() === '' || editMagnitude.trim() === '' || editDate.trim() === '') return;
    await updateItem({ variables: { id: editItemId, location: editLocation, magnitude: parseFloat(editMagnitude), date: editDate } });
    setEditItemId(null);
    setEditLocation('');
    setEditMagnitude('');
    setEditDate('');
  };

  const handleDeleteEarthquake = async (id) => {
    await deleteItem({ variables: { id } });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="grid items-center justify-items-center min-h-screen p-8 pb-20 gap-16">
      <main className="flex flex-col gap-8 row-start-2 items-center">
        <h1 className="text-3xl">Earthquakes catalogue from 1970 to 2014</h1>
        <form onSubmit={handleCreateEarthquake} className="flex flex-col gap-4">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location"
            className="border p-2 rounded text-black"
          />
          <input
            type="number"
            value={magnitude}
            onChange={(e) => setMagnitude(e.target.value)}
            placeholder="Enter magnitude"
            className="border p-2 rounded text-black"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="Enter date"
            className="border p-2 rounded text-black"
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Add Item
          </button>
        </form>

        <table className="table-auto border-collapse border border-gray-400">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Location</th>
              <th className="border border-gray-300 px-4 py-2">Magnitude</th>
              <th className="border border-gray-300 px-4 py-2">Date</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={item.id}>
                <td className="border border-gray-300 px-4 py-2">{item.location}</td>
                <td className="border border-gray-300 px-4 py-2">{item.magnitude}</td>
                <td className="border border-gray-300 px-4 py-2">{new Date(item.date).toLocaleDateString()}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => {
                      setEditItemId(item.id);
                      setEditLocation(item.location);
                      setEditMagnitude(item.magnitude.toString());
                      setEditDate(item.date);
                    }}
                    className="ml-2 bg-yellow-500 text-white p-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEarthquake(item.id)}
                    className="ml-2 bg-red-500 text-white p-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {editItemId && (
          <div className="fixed w-1/2 h-1/2">
            <form onSubmit={handleUpdateEarthquake} className="flex flex-col gap-4 px-32 py-8 bg-[#1e293b]">
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                placeholder="Enter new location"
                className="border p-2 rounded text-black"
              />
              <input
                type="number"
                value={editMagnitude}
                onChange={(e) => setEditMagnitude(e.target.value)}
                placeholder="Enter new magnitude"
                className="border p-2 rounded text-black"
              />
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                placeholder="Enter new date"
                className="border p-2 rounded text-black"
              />
              <button type="submit" className="bg-green-500 text-white p-2 rounded">
                Update Item
              </button>
              <button onClick={() => {
                setEditItemId(null);
                setEditLocation('');
                setEditMagnitude('');
                setEditDate('');
              }} className="bg-gray-500 text-white p-2 rounded">
                Cancel
              </button>
            </form>            
          </div>
        )}
      </main>
    </div>
  );
}