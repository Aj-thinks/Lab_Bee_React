import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";


import "./App.css";
//import Login from "./Login_Register";
import Login from "./LoginRegister/Login";
import Register from "./LoginRegister/Register";
import ForgotPassword from "./LoginRegister/ForgotPassword";
import TrailPage from "./TrailPage";
import SidenavigationBar from "./components/sidenavbar";
import Jobcard from "./Pages/Jobcard";
import JobcardBMRCL from "./Pages/Jobcard_BMRCL";
import QuoteTable from "./Pages/QuoteTable";
import NotFoundPage from "./Pages/NotFoundPage";
import Quotation from "./Pages/Quotation";
import QuotationPdf from "./Pages/QuotationPdf";
import DocToPdf from "./components/DocToPdf";
import UserLogoutDialog from "./components/UserLogoutDialog";
import QuotationRequirements from "./Pages/QuotationRequirements";
import JobcardRequirements from "./Pages/JobcardRequirements";
import ChamberAndCalibration from "./components/ChamberCalibration";
import Home from "./Pages/Home";
import JCHome from "./Pages/JCHome";
import Slotbooking from "./Pages/Slotbooking";





function App() {
  return (

    <BrowserRouter>
      <div className="App">
        <ToastContainer position="top-center" />
        <Routes>
          {/* <Route path="/" element={<Login />} /> */}
          <Route path="/" exact element={<Login />}></Route>
          <Route path="/register" exact element={<Register />}></Route>
          <Route path="/reset-password" exact element={<ForgotPassword />}></Route>


          <Route path="" element={<SidenavigationBar />} >

            <Route path='home' element={<Home />} />
            <Route path='/quotation_dashboard' element={<QuoteTable />} />
            <Route path='/quotation' element={<Quotation />} />
            <Route path="/quotation/:id" element={<Quotation />} />
            <Route path="/quotation_essentials" element={<QuotationRequirements />} />
            <Route path="/quotationPdf/:id" element={<QuotationPdf />} />
            <Route path="/quotationWordToPdf/:id" element={<DocToPdf />} />

            <Route path='/jobcard_dashboard' element={<JCHome />} />
            <Route path='/jobcard' element={<Jobcard />} />
            <Route path='/jobcard/:id' element={<Jobcard />} />
            <Route path='/jobcard_essentials' element={<JobcardRequirements />} />
            {/* <Route path='/jobcard' element={<JobcardBMRCL />} /> // BMRCL Job-Card */}

            <Route path='/chamber-calibration' element={<ChamberAndCalibration />} />

            <Route path='/slot_booking' element={<Slotbooking />} />

            <Route path="/userlogout" element={<UserLogoutDialog />} />
            <Route path='/trailpage' element={<TrailPage />} />
            <Route path='*' element={<NotFoundPage />} />

          </Route>

        </Routes>
      </div>
    </BrowserRouter >

  );
};


export default App;



