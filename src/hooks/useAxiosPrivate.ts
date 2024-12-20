import { useEffect } from 'react';

import useRefreshToken from './useRefreshToken';
import { initialAuthState, useAuth } from '../contexts/AuthContext';
import { axiosPrivate } from '../lib/axios';


export default function useAxiosPrivate() {
  const refresh = useRefreshToken();
  const { auth, setAuth } = useAuth();


  useEffect(() => {
    const requestIntercept = axiosPrivate.interceptors.request.use(
      config => {
        if (!config.headers.Authorization)
          config.headers.Authorization = auth.accessToken
            ? `Bearer ${auth.accessToken}`
            : undefined;

        return config;
      },
      error => Promise.reject(error),
    );

    const responseIntercept = axiosPrivate.interceptors.response.use(
      response => response,
      async error => {
        try {
          const prevRequest = error?.config;
          if (error?.response?.status === 403 && !prevRequest?.sent) {
            prevRequest.sent = true;
            const newAccessToken = await refresh();
            prevRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            return axiosPrivate(prevRequest);
          }
        } catch (err) {
          

          setAuth(initialAuthState);
        }
        return Promise.reject(error);
      },
    );

    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept);
      axiosPrivate.interceptors.response.eject(responseIntercept);
    };
  }, [auth, refresh, setAuth]);

  return axiosPrivate;
}
