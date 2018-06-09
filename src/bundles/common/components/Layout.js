import React from 'react';
import PropTypes from 'prop-types';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';

export default class MainPage extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
  };

  render() {
    return (
      <React.Fragment>
        <CssBaseline />
        <AppBar>
          <Toolbar>
            <Typography variant="title" color="inherit">
              Voice memos
            </Typography>
          </Toolbar>
        </AppBar>
        <div style={{ marginTop: 64 }}>{this.props.children}</div>
      </React.Fragment>
    );
  }
}
