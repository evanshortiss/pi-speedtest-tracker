import { SpeedometerOutline } from 'react-ionicons';

export default function Navbar() {
  return (
    <header className="pb-5">
      <div className="inline-block pl-2">
        <SpeedometerOutline
          cssClasses={'inline-block pb-2'}
          width="38px"
          height="38px"
        ></SpeedometerOutline>
      </div>
      <h1 className="text-2xl inline-block align-baseline">
        &nbsp;Speedtest Tracker
      </h1>
      <hr />
    </header>
  );
}
