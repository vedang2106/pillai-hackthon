import { useCallback, useEffect, useState } from 'react';
import { zonesApi } from '../services/api';
import { getSocket, joinEventRoom } from '../services/socket';

export function useZones(eventId) {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!eventId) return;
    try {
      setError(null);
      const { data } = await zonesApi.listByEvent(eventId);
      setZones(data.zones ?? []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load zones');
      setZones([]);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (!eventId) {
      setZones([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    refresh();
  }, [eventId, refresh]);

  useEffect(() => {
    if (!eventId) return undefined;
    const leave = joinEventRoom(eventId);
    const socket = getSocket();
    const onUpdate = () => refresh();
    socket.on('zones:updated', onUpdate);
    socket.on('zone:updated', onUpdate);
    return () => {
      leave();
      socket.off('zones:updated', onUpdate);
      socket.off('zone:updated', onUpdate);
    };
  }, [eventId, refresh]);

  return { zones, loading, error, refresh };
}
