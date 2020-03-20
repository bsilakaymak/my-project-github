import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import MainNavigation from "./shared/component/Navigation/MainNavigation";
// import Users from "./users/pages/Users";
// import NewPlace from "./places/pages/NewPlace";
// import UserPlaces from "./places/pages/UserPlaces";
// import UpdatePlace from "./places/pages/UpdatePlace";
// import Auth from "./users/pages/Auth";
import { AuthContext } from "./shared/context/auth-context";
import { useAuth } from "./shared/hooks/auth-hook";
import LoadingSpinner from "./shared/component/UIElements/LoadingSpinner";
const BucketList = React.lazy(() => import("./users/pages/BucketList"));
const Users = React.lazy(() => import("./users/pages/Users"));
const NewPlace = React.lazy(() => import("./places/pages/NewPlace"));
const UserPlaces = React.lazy(() => import("./places/pages/UserPlaces"));
const UpdatePlace = React.lazy(() => import("./places/pages/UpdatePlace"));
const Auth = React.lazy(() => import("./users/pages/Auth"));
const App = () => {
  const { token, login, logout, userId } = useAuth();

  let routes;
  if (token) {
    routes = (
      <Switch>
        {/* <BucketContext.Provider value = {{}}> */}
          <Route path="/" exact>
            <Users />
          </Route>
          <Route path="/:userId/places" exact>
            <UserPlaces />
          </Route>
          <Route path="/:userId/mybucketlist">
            <BucketList />
          </Route>
          <Route path="/places/new" exact>
            <NewPlace />
          </Route>
          <Route path="/places/:placeId/">
            <UpdatePlace />
          </Route>
          <Redirect to="/" />
        {/* </BucketContext.Provider> */}
      </Switch>
    );
  } else {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users />
        </Route>
        <Route path="/:userId/places" exact>
          <UserPlaces />
        </Route>
        <Route path="/auth">
          <Auth />
        </Route>
        <Redirect to="/auth" />
      </Switch>
    );
  }
  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token,
        login,
        logout,
        userId
      }}
    >
      <Router>
        <MainNavigation />
        <main>
          <Suspense
            fallback={
              <div className="center">
                <LoadingSpinner />
              </div>
            }
          >
            {routes}
          </Suspense>
        </main>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
