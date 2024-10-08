import React, { createContext, useCallback, useEffect, useState } from "react";
import { serverBaseAddress } from "./APIPage";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Create the context:
export const UserContext = createContext();

//Create the provider component:
export const UserProvider = ({ children }) => {
  //Old method:
  // const navigate = useNavigate();

  // const [loggedInUser, setLoggedInUser] = useState("");
  // const [loggedInUserDepartment, setLoggedInUserDepartment] = useState("");

  // axios.defaults.withCredentials = true;

  // // To get the logged in user name:
  // useEffect(() => {
  //   axios
  //     .get(`${serverBaseAddress}/api/getLoggedInUser`)
  //     .then((res) => {
  //       if (res.data.valid) {
  //         // setLoggedInUserRole(res.data.user_role)
  //         setLoggedInUser(res.data.user_name);
  //         setLoggedInUserDepartment(res.data.user_department);
  //       } else {
  //         navigate("/");
  //       }
  //     })
  //     .catch((err) => console.log(err));
  // }, []);

  //New method:
  const navigate = useNavigate();

  const [loggedInUser, setLoggedInUser] = useState("");
  const [loggedInUserDepartment, setLoggedInUserDepartment] = useState("");
  const [loggedInUserRole, setLoggedInUserRole] = useState("");

  // To set the axios defaults only once
  useEffect(() => {
    axios.defaults.withCredentials = true;
  }, []);

  const fetchLoggedInUser = useCallback(() => {
    axios
      .get(`${serverBaseAddress}/api/getLoggedInUser`)
      .then((res) => {
        if (res.data.valid) {
          setLoggedInUser(res.data.user_name);
          setLoggedInUserDepartment(res.data.user_department);
          setLoggedInUserRole(res.data.user_role);
        } else {
          navigate("/");
        }
      })
      .catch((err) => console.log(err));
  }, [navigate]);

  useEffect(() => {
    fetchLoggedInUser();
  }, [fetchLoggedInUser]);

  return (
    <UserContext.Provider
      value={{
        loggedInUser,
        setLoggedInUser,
        loggedInUserDepartment,
        setLoggedInUserDepartment,
        loggedInUserRole,
        setLoggedInUserRole,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
