import { useState } from 'react';
import './App.css';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs'; // Adjust the import path as needed

function App() {
  return (
    <>
      <div className="top-half">
        <div>
          <h1>Play to Rank</h1>
          <div>
            <p className="sub-text">Share ratings on your most (or least) liked games!</p>
          </div>
        </div>
      </div>
      <div className="bot-half">
        <div className="bg-white p-4 rounded-lg shadow-md"> 
          <p className="sub-text2 mb-4">Log in to rate games you've played:</p>
          <Tabs defaultValue="account" className="w-[400px]">
            <TabsList>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>
            <TabsContent value="account" className="font-custom text-custom-blue"> 
              Make changes to your account here.
            </TabsContent>
            <TabsContent value="password" className="font-custom text-custom-blue"> 
              Change your password here.
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

export default App;