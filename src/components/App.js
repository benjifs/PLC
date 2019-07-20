import "../css/App.css";
import React from "react";
import { Route, Switch } from "react-router-dom";
import Header from "./Header";
// import Footer from "./Footer";
import RootPage from "./RootPage";
import Login from "./Login";
import AnnotList from "./AnnotList";
import { ProtectedRoute } from "./ProtectedRoute";
import { RandomPage } from "./404Page";
import D3Page from "./D3Page";

class App extends React.Component {
  state = {
    username: ""
  };

  LoginHandler = item => {
    console.log("pass from login:", item);
    this.setState({ username: item });
  };

  render() {
    return (
      // <div className="ui container">
      //   <AnnotList />
      // </div>
      <div className="app">
        {/* <BrowserRouter>
          <div> */}
        <Header username={this.state.username} />
        <Switch>
          <Route path="/" exact component={RootPage} />
          <Route
            path="/login"
            render={props => (
              <Login {...props} onNameSubmit={this.LoginHandler} />
            )}
          />
          <Route path="/user/:username" exact component={AnnotList} />
          <ProtectedRoute path="/dashboard" component={AnnotList} />
          <Route path="/d3" exact component={D3Page} />
          <Route path="/d3/user/:user" exact component={D3Page} />
          <Route path="/d3/topic/:topic" exact component={D3Page} />
          <Route path="*" component={RandomPage} />
        </Switch>
        {/* <Footer /> */}
        {/* </div>
        </BrowserRouter> */}
      </div>
    );
  }
}

export default App;
