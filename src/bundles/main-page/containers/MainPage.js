import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import RecordIcon from '@material-ui/icons/Mic';
import StopIcon from '@material-ui/icons/Stop';
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

const activeColor = Colors.purple[400];

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
    flexShrink: 1,
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
      isRecording: false,
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
          this.audioContext = new AudioContext();
          this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
          this.setState({ recorder: new Recorder(this.mediaStreamSource) });
        },
        error => log(error),
      );

      this.player = new Audio();
      document.body.appendChild(this.player);
    } catch (e) {
      log('No web audio support in this browser!');
    }
  }

  /**
   * {Audio}
   */
  player;

  /**
   * {AudioContext}
   */
  audioContext;

  /**
   * {Canvas}
   */
  inputCanvas;

  /**
   * number
   */
  analyzedUpdateLoop;

  componentWillMount(){
  }

  componentWillUnmount() {
    this.state.recorder.clear();
    document.body.removeChild(this.player);
    cancelAnimationFrame(this.analyzedUpdateLoop);
  }

  initAnalyzer = (audioContext) => {
    const analyser = audioContext.createAnalyser();
    this.mediaStreamSource.connect(analyser);

    analyser.fftSize = 128;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.inputCanvas.width = window.innerWidth / 2;
    this.inputCanvas.height = window.innerHeight / 4;
    const canvasCtx = this.inputCanvas.getContext("2d");

    const draw = () => {
      if(!this.inputCanvas) return;

      this.analyzedUpdateLoop = requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);
      canvasCtx.clearRect(0, 0, this.inputCanvas.width, this.inputCanvas.height);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = activeColor;

      canvasCtx.beginPath();

      const sliceWidth = this.inputCanvas.width * 1.0 / bufferLength;
      let x = 0;

      for(let i = 0; i < bufferLength; i++) {

        const v = dataArray[i] / 128.0;
        const y = v * this.inputCanvas.height/2;

        if(i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(this.inputCanvas.width, this.inputCanvas.height/2);
      canvasCtx.stroke();
    };

    draw();
  };

  onRecordStart = () => {
    this.setState({ isRecording: true });
    this.state.recorder.record();
    this.initAnalyzer(this.audioContext);
  };

  onRecordEnd = () => {
    this.state.recorder.stop();
    this.state.recorder.exportWAV((blob) => {
      const url = URL.createObjectURL(blob);
      const now = new Date();
      this.props.dispatch(actions.putVoiceMemo({
        audioSource: url,
        name: 'Voice memo at: ' + now.toLocaleDateString(),
        createdAt: now,
        length: (blob.size / this.state.recorder.context.sampleRate) / this.state.recorder.config.numChannels,
      }));
      this.state.recorder.clear();
    });
    this.setState({ isRecording: false });

    // stop redrawing and clear visualization
    cancelAnimationFrame(this.analyzedUpdateLoop);
    const canvasCtx = this.inputCanvas.getContext("2d");
    canvasCtx.clearRect(0, 0, this.inputCanvas.width, this.inputCanvas.height);
  };

  playVoiceMemo = (vm) => {
    try {
      this.props.dispatch(actions.playVoiceMemo(vm));
      this.player.onended = () => {
        this.props.dispatch(actions.stopVoiceMemo(vm));
      };
      this.player.src = vm.audioSource;
      this.player.play();
    } catch (e){
      log('Cant play ' + vm.name + ': ' + e.message);
    }
  };

  stopVoiceMemo = () => {
    try {
      if(this.props.activeVoiceMemo){
        this.props.dispatch(actions.stopVoiceMemo(this.props.activeVoiceMemo));
        this.player.pause();
      }
    } catch (e){
      log('Cant stop ' + vm.name + ': ' + e.message);
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

          const typographyStyle = {
            color: vm === activeVoiceMemo && 'white',
          };

          return (
            <ExpansionPanel
              key={vm.createdAt.toUTCString()}
              expanded={isActive}
              onClick={() => isActive ? this.stopVoiceMemo() : this.playVoiceMemo(vm)}
              style={{
                backgroundColor: vm === activeVoiceMemo && activeColor,
              }}
            >
              <ExpansionPanelSummary>
                <Typography style={typographyStyle} className={classes.secondaryHeading}>
                  {vm.createdAt.toLocaleDateString()} <br/>
                  {vm.createdAt.toLocaleTimeString()}
                </Typography>
                <Typography style={typographyStyle} className={classes.heading}>
                  {vm.name}
                </Typography>
                <Typography style={typographyStyle} className={classes.secondaryHeading}>
                  {secondsToTimeString(Math.ceil(vm.length))}
                </Typography>
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
          style={{
            height: 64,
            width: 64,
            position: 'fixed',
            right: 16,
            bottom: 16,
            backgroundColor: this.state.isRecording && activeColor
          }}
          onClick={ this.state.isRecording ? this.onRecordEnd : this.onRecordStart}
        >
          {this.state.isRecording ? <StopIcon /> : <RecordIcon />}
        </Button>
        <canvas
          style={{
            pointerEvents: 'none',
            position: 'fixed',
            height: '100%',
            width: '100%',
            top: 0,
            zIndex: 100
          }}
          ref={element => this.inputCanvas = element}
        />
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
