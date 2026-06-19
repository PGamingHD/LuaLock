import './css/homepage.css';
import { Helmet } from 'react-helmet';
import { useEffect, useState } from 'react';

function Homepage() {

  //ADD ELEMENT FOR HOME ASWELL LATER!
  const [aboutElement, setAboutElement] = useState(null);

  useEffect(() => {
    setAboutElement(document.getElementById("abouts"));
  }, [])

  const handleClick = () => {
    aboutElement.scrollIntoView({behavior: 'smooth', block: 'start'});
  }

  return (
    <div className="App">
      <Helmet>
        <title>LuaLock | Home</title>
      </Helmet>
      <div className='site-header'>
        <a className='nav-symbol' href='/'>luaLock</a>
        <a className='nav-home' href='/'>Home</a>
        <a className='nav-about' onClick={handleClick} href='#about'>About</a>
        <a className='nav-features' href='#features'>Features</a>
        <a className='nav-pricing' href='#pricing'>Pricing</a>
        <button className='nav-login'>Login</button>
      </div>
      <div className='about' id='abouts'>

      </div>
      <h1 className='site-indev'>Site in Development</h1>
      <a className='site-dclink' href='https://discord.gg/xQFFRzhJu2'>Click me for our Services Discord</a>
      <script>
      </script>
    </div>
  );
  
}

export default Homepage;
