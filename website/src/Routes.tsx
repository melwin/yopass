import { Route } from 'react-router-dom';

import CreateSecret from './createSecret/CreateSecret';
import DisplaySecret from './displaySecret/DisplaySecret';
import Upload from './createSecret/Upload';
import Image from './createSecret/Image';

export const Routes = () => {
  return (
    <div>
      <Route path="/" exact={true} component={CreateSecret} />
      <Route path="/upload" exact={true} component={Upload} />
      <Route path="/image" exact={true} component={Image} />
      <Route exact={true} path="/s/:key/:password" component={DisplaySecret} />
      <Route exact={true} path="/s/:key" component={DisplaySecret} />
      <Route exact={true} path="/f/:key/:password" component={DisplaySecret} />
      <Route exact={true} path="/f/:key" component={DisplaySecret} />
    </div>
  );
};
