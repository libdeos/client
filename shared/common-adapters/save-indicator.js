// @flow
import * as React from 'react'
import Box from './box'
import Icon from './icon'
import ProgressIndicator from './progress-indicator'
import Text from './text'
import {globalColors, globalMargins, globalStyles} from '../styles'

type SaveState = 'same' | 'saving' | 'justSaved'

type SaveState2 = 'steady' | 'saving' | 'savingHysteresis' | 'justSaved'

type Props = {
  saving: boolean,
  minSavingTimeMs: number,
  savedTimeoutMs: number,
  onStateChange?: string => void,
}

type State = {
  saving: boolean,
  lastSave: number,
  saveState: SaveState2,
  saveStateChanged: number,
}

const computeNextState = (props: Props, state: State, now: number): null | SaveState2 | number => {
  const timeSinceLastSave = now - state.lastSave
  const timeSinceSaveStateChanged = now - state.saveStateChanged
  const timeToJustSaved = props.minSavingTimeMs - timeSinceLastSave

  const {saveState} = state
  switch (saveState) {
    case 'steady':
      if (state.saving) {
        return 'saving'
      }

      return null

    case 'saving':
      if (state.saving) {
        return null
      }

      if (timeToJustSaved > 0) {
        return 'savingHysteresis'
      } else {
        return 'justSaved'
      }

    case 'savingHysteresis':
      if (state.saving) {
        return 'saving'
      }

      if (timeToJustSaved > 0) {
        return timeToJustSaved
      }

      return 'justSaved'

    case 'justSaved':
      if (state.saving) {
        return 'saving'
      }

      const timeToSteady = props.savedTimeoutMs - timeSinceSaveStateChanged
      if (timeToSteady > 0) {
        return timeToSteady
      }

      return 'steady'

    default:
      // eslint-disable-next-line no-unused-expressions
      ;(saveState: empty)
  }

  throw new Error('Unexpected state')
}

const containerStyle = {
  ...globalStyles.flexBoxRow,
  alignItems: 'center',
  height: globalMargins.medium,
  justifyContent: 'center',
}

class SaveIndicator extends React.Component<Props, State> {
  _timeoutID: ?TimeoutID

  constructor(props: Props) {
    super(props)
    this.state = {saving: false, lastSave: 0, saveState: 'steady', saveStateChanged: 0}
  }

  static getDerivedStateFromProps = (nextProps: Props, prevState: State) => {
    if (nextProps.saving === prevState.saving) {
      return null
    }

    const onStateChange = nextProps.onStateChange
    const newPartialState = {saving: nextProps.saving, ...(nextProps.saving ? {lastSave: Date.now()} : {})}
    if (onStateChange) {
      onStateChange(`merging ${JSON.stringify(newPartialState)} into ${JSON.stringify(prevState)}`)
    }
    return newPartialState
  }

  _runStateMachine = () => {
    if (this._timeoutID) {
      clearTimeout(this._timeoutID)
      this._timeoutID = null
    }

    const now = Date.now()
    const result = computeNextState(this.props, this.state, now)
    if (!result) {
      return
    }

    if (typeof result === 'number') {
      this._timeoutID = setTimeout(this._runStateMachine, result)
      return
    }

    const onStateChange = this.props.onStateChange
    const newPartialState = {saveState: result, saveStateChanged: now}
    if (onStateChange) {
      onStateChange(`merging ${JSON.stringify(newPartialState)} into ${JSON.stringify(this.state)}`)
    }
    this.setState(newPartialState)
  }

  componentDidUpdate = () => {
    this._runStateMachine()
  }

  render = () => {
    const {saveState} = this.state
    switch (saveState) {
      case 'steady':
        return null

      case 'saving':
      case 'savingHysteresis':
        return (
          <Box style={containerStyle}>
            <ProgressIndicator style={{width: globalMargins.medium}} />
          </Box>
        )
      case 'justSaved':
        return (
          <Box style={containerStyle}>
            <Icon type="iconfont-check" style={{color: globalColors.green}} />
            <Text type="BodySmall" style={{color: globalColors.green2}}>
              &nbsp; Saved
            </Text>
          </Box>
        )

      default:
        // eslint-disable-next-line no-unused-expressions
        ;(saveState: empty)
    }
  }
}

export type {SaveState}
export default SaveIndicator
