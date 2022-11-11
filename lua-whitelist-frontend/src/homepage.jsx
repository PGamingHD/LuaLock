import './css/homepage.css';
import { Helmet } from 'react-helmet';

function Homepage() {
  return (
    <div className="App">
      <Helmet>
        <title>LuaLock | Home</title>
      </Helmet>
      <nav className="main-header navbar">
        <img src='./storage/logo.png' width='75' className='align-text-top img'></img>
        <div className='navbar-nav nav navbar-center'>
          <li>
            <a href="https://discord.gg/discord" className='text-decoration-none'>
              <h2>Discord</h2>
            </a>
          </li>
        </div>
        <h1>Hey</h1>
      </nav>
    </div>
  );
}

export default Homepage;
