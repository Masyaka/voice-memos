import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import RecordIcon from '@material-ui/icons/Mic';
import DeleteIcon from '@material-ui/icons/Delete';
import Typography from '@material-ui/core/Typography';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import * as Colors from '@material-ui/core/colors';

import actions from '../actions/main-page';
import VoiceMemoProgress from '../components/VoiceMemoProgress';
import { secondsToTimeString } from '../../../utils/time';
import Recorder from '../../../utils/recorder';

const log = (msg) => {
  const node = document.createElement('p');
  node.innerText = msg;
  document.body.appendChild(node);
};

const styles = theme => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    paddingLeft: 16,
    paddingRight: 16,
    flexShrink: 0,
    flexGrow: 1,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
    flexShrink: 0,
  },
});

export class MainPage extends React.Component {
  static propTypes = {
    voiceMemos: PropTypes.array.isRequired,
    activeVoiceMemo: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
  };

  static defaultProps = {
    activeVoiceMemo: null,
  };

  constructor() {
    super();

    this.state = {
      /**
       * {Recorder}
       */
      recorder: null,
    };

    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;

      window.URL = window.URL || window.webkitURL;
      navigator.getUserMedia(
        { audio: true, video: false },
        (stream) => {
          const audioContext = new AudioContext();
          const input = audioContext.createMediaStreamSource(stream);
          this.setState({ recorder: new Recorder(input) });
          log('recorder initialized');
        },
        error => log(error),
      );

      this.player = new Audio();
      document.body.appendChild(this.player);
    } catch (e) {
      log('No web audio support in this browser!');
    }
  }

  componentWillUnmount() {
    this.state.recorder.clear();
    document.body.removeChild(this.player)
  }

  /**
   * {Audio}
   */
  player;

  onRecordStart = () => {
    this.state.recorder.record();
  };

  onRecordEnd = () => {
    this.state.recorder.stop();
    log('recorder stopped');
    this.state.recorder.exportWAV((blob) => {
      const url = URL.createObjectURL(blob);
      const now = new Date();
      this.props.dispatch(actions.putVoiceMemo({
        audioSource: url,
        name: 'Voice memo at: ' + now.toLocaleDateString(),
        createdAt: now,
        length: (blob.size / this.state.recorder.context.sampleRate) / 8,
      }));
      this.state.recorder.clear();
    });
  };

  playVoiceMemo = (vm) => {
    try {
      this.props.dispatch(actions.playVoiceMemo(vm));
      this.player.onended = () => {
        this.props.dispatch(actions.stopVoiceMemo(vm));
        log(vm.name + ' stopped');
      };
      this.player.src = vm.audioSource;
      this.player.play();
      log('playing ' + vm.name);
    } catch (e){
      log('cant play ' + vm.name + ': ' + e.message);
    }
  };

  onDelete = (vm) => {
    this.props.dispatch(actions.deleteVoiceMemo(vm));
  };

  render() {
    const {
      voiceMemos,
      activeVoiceMemo,
      classes
    } = this.props;
    return (
      <div>
        {voiceMemos.map((vm) => {
          const isActive = vm === activeVoiceMemo;

          return (
            <ExpansionPanel
              key={vm.createdAt.toUTCString()}
              expanded={isActive}
              onClick={() => this.playVoiceMemo(vm)}
              style={{
                backgroundColor: vm === activeVoiceMemo && Colors.purple[400],
                color: vm === activeVoiceMemo && 'white',
              }}
            >
              <ExpansionPanelSummary>
                <Typography className={classes.secondaryHeading}>{vm.createdAt.toLocaleTimeString() + ' ' + vm.createdAt.toLocaleDateString()}</Typography>
                <Typography className={classes.heading}>{vm.name}</Typography>
                <Typography className={classes.secondaryHeading}>{secondsToTimeString(Math.ceil(vm.length))}</Typography>
                <div className={classes.secondaryHeading}>
                  <DeleteIcon
                    onClick={(e) => {
                      e.stopPropagation();
                      this.onDelete(vm);
                    }}
                    color="secondary"
                    aria-label="delete"
                  />
                </div>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                {isActive && <VoiceMemoProgress player={this.player} style={{ width: '100%' }}/>}
              </ExpansionPanelDetails>
            </ExpansionPanel>
          );
        })}
        <Button
          disabled={!this.state.recorder}
          variant="fab"
          color="primary"
          aria-label="record"
          style={{ position: 'fixed', right: 16, bottom: 16 }}
          onMouseDown={this.onRecordStart}
          onMouseUp={this.onRecordEnd}
        >
          <RecordIcon />
        </Button>
      </div>
    );
  }
}

export default withStyles(styles)(
  connect((state) => {
    return {
      voiceMemos: state['main-page'].voiceMemos,
      activeVoiceMemo: state['main-page'].activeVoiceMemo,
    };
  })(MainPage)
)
