import React from 'react';
import PropTypes from 'prop-types';
import LinearProgress from '@material-ui/core/LinearProgress';

export default class VoiceMemoProgress extends React.Component {
  static propTypes = {
    player: PropTypes.object.isRequired,
    style: PropTypes.object,
  };

  componentWillUnmount() {
    this.props.player.removeEventListener('timeupdate', this.update);
  }

  componentWillMount() {
    this.props.player.addEventListener('timeupdate', this.update);
  }

  update = () => this.forceUpdate();

  render() {
    const {
      player,
      style,
    } = this.props;

    return (
      <div style={style}>
        <LinearProgress variant="determinate" value={(player.currentTime / player.duration) * 100 || 0} />
      </div>
    );
  }
}
