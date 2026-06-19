import './css/error.css';
import React, { Helmet } from 'react-helmet';

function Homepage() {

  return (
    <div>
      <Helmet>
        <title>LuaLock | 404</title>
      </Helmet>

      <div className='Error-bg'>
        <p className='Error-title'>404</p>
        <p className='Error-desc'>The page you are looking for does not seem to exist?</p>
      </div>
    </div>
  );
}

export default Homepage;
