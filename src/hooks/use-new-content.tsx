'use client';

import React, { createContext, useState, Dispatch, SetStateAction, useContext } from 'react';

interface ContextValue<T> {
  showNewForm: T;
  setShowNewForm: Dispatch<SetStateAction<T>>;
}

type NewContentType = boolean | undefined;

const NewContentContext = createContext<ContextValue<NewContentType> | null>(null);

interface Props {
  [propName: string]: any;
}

const NewContentContextProvider = (props: Props) => {
  const [showNewForm, setShowNewForm] = useState<NewContentType>(undefined);

  return <NewContentContext.Provider value={{ showNewForm, setShowNewForm }} {...props} />;
};

const useShowNewForm = () => {
  const context = useContext(NewContentContext);
  if (!context) {
    throw new Error('useShowNewForm must be used within a NewContentContext');
  }

  return context;
};

export { NewContentContextProvider, useShowNewForm };
