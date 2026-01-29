import Container from 'react-bootstrap/Container';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import AppLayout from './components/AppLayout.jsx';

function App() {
  return (
    <>
    <div>
      <h3>Expense APP</h3>
    </div>
      <Routes>
        <Route path="/" element={
            <AppLayout><Home /></AppLayout>
          }/>
        <Route path="/login" element={
            <AppLayout><Login /></AppLayout>
          }/>
      </Routes>
    </>
  )
}

export default App;







































// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'
// import Student from './pages/examples/Student'
// import Student2 from './pages/examples/Student2'
// import StudentList from './pages/examples/StudenList'
// import StudentList1 from './pages/examples/Studentlist1'
// import Student4 from './pages/examples/Student4'
// function App() {


//   return (
//     <div>
//       <h1>🎓 React Student Management Examples</h1>
//       <p>Demo of different React component patterns</p>
      
//       <Student/>
      
//       <StudentList students={[
//         {name:"Alice", rollnumber:3},
//         {name:"Bob", rollnumber:4},
//         {name:"Charlie", rollnumber:5}
//       ]}/>
      
//       <StudentList1 students={[
//         {name:"Alice", rollnumber:3},
//         {name:"Bob", rollnumber:4},
//         {name:"Charlie", rollnumber:5},
//         {name:"David", rollnumber:6}
//       ]}/>
      
//       <Student4/>
//     </div>
//   )
// }

// export default App