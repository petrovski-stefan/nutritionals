import { useEffect, useState } from 'react';
import type { BackendCollection } from '../types/collection';
import { CollectionService } from '../api/collection';
import { useAuthContext } from '../context/AuthContext';

export default function MyLists() {
  const [collections, setCollections] = useState<Array<BackendCollection>>([]);
  const { accessToken } = useAuthContext();
  useEffect(() => {
    const getCollections = async () => {
      const response = await CollectionService.getCollections(accessToken);

      if (response.status) {
        setCollections(response.data);
      }
    };
    getCollections();
  }, []);
  return (
    <div>
      <h1>My collections</h1>
      {collections.map(({ id, name }) => (
        <p key={id}>{name}</p>
      ))}
    </div>
  );
}
