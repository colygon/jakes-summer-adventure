import { useState, useEffect, useCallback } from 'react';
import { summerDb, createAutoSaver } from '../utils/firebase';

// Enhanced hook that auto-saves to database and provides real-time sync
export function useAutoSaveData(dataType, initialValue) {
  const [data, setData] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saving', 'saved', 'error'

  // Choose the right database functions based on data type
  const getDbFunctions = useCallback(() => {
    switch (dataType) {
      case 'timeline':
        return {
          save: summerDb.saveTimelineProgress,
          load: summerDb.loadTimelineProgress,
          onChange: summerDb.onTimelineChange
        };
      case 'books':
        return {
          save: summerDb.saveBookProjects,
          load: summerDb.loadBookProjects,
          onChange: summerDb.onBookProjectsChange
        };
      case 'notes':
        return {
          save: summerDb.saveWritingNotes,
          load: summerDb.loadWritingNotes,
          onChange: summerDb.onWritingNotesChange
        };
      default:
        throw new Error(`Unknown data type: ${dataType}`);
    }
  }, [dataType]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const { load } = getDbFunctions();
        const savedData = await load();

        if (savedData !== null) {
          setData(savedData);
        }

        setIsLoading(false);
      } catch (error) {
        console.error(`Error loading ${dataType} data:`, error);
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [dataType, getDbFunctions]);

  // Create auto-saver with status tracking
  const autoSave = useCallback(
    createAutoSaver(async (newData) => {
      try {
        setSaveStatus('saving');
        const { save } = getDbFunctions();
        const success = await save(newData);

        if (success) {
          setSaveStatus('saved');
          setLastSaved(new Date().toLocaleTimeString());
        } else {
          setSaveStatus('error');
        }
      } catch (error) {
        console.error(`Error saving ${dataType} data:`, error);
        setSaveStatus('error');
      }
    }, 800),
    [dataType, getDbFunctions]
  );

  // Set up real-time listener
  useEffect(() => {
    const { onChange } = getDbFunctions();
    const unsubscribe = onChange((newData) => {
      if (JSON.stringify(newData) !== JSON.stringify(data)) {
        setData(newData);
        setSaveStatus('saved');
      }
    });

    return unsubscribe;
  }, [getDbFunctions, data]);

  // Enhanced setter that triggers auto-save
  const setDataWithAutoSave = useCallback((newData) => {
    const finalData = typeof newData === 'function' ? newData(data) : newData;
    setData(finalData);
    autoSave(finalData);
  }, [data, autoSave]);

  // Manual save function
  const saveNow = useCallback(async () => {
    try {
      setSaveStatus('saving');
      const { save } = getDbFunctions();
      const success = await save(data);

      if (success) {
        setSaveStatus('saved');
        setLastSaved(new Date().toLocaleTimeString());
        return true;
      } else {
        setSaveStatus('error');
        return false;
      }
    } catch (error) {
      console.error(`Error manually saving ${dataType} data:`, error);
      setSaveStatus('error');
      return false;
    }
  }, [data, dataType, getDbFunctions]);

  return [
    data,
    setDataWithAutoSave,
    {
      isLoading,
      saveStatus,
      lastSaved,
      saveNow
    }
  ];
}

export default useAutoSaveData;