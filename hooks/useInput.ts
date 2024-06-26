import { ChangeEvent, Dispatch, SetStateAction, useCallback, useState } from 'react';

// 매개변수  : [리턴타입]
// [리턴타입 부분을 변수로 별도 선언]

type ReturnType<T = any> = [
  T,
  (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string) => void,
  Dispatch<SetStateAction<T>>,
];

const useInput = <T>(initialData: T): ReturnType<T> => {
  const [value, setValue] = useState<T>(initialData);
  const handler = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string) => {
    if (typeof e === 'string') {
      setValue(e as T);
    } else {
      setValue(e.target.value as T);
    }

  }, []);

  return [value, handler, setValue];
};

export default useInput;
