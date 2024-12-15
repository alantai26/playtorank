import { useState } from 'react'
import './App.css'


function App() {
  const [count, setCount] = useState(0)

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
          <div><p className="sub-text2"> Choose at least 10 games you have played:</p>
          </div>
 
          
          </div>
     
    </>
  )
}
export default App
