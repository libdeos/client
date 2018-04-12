// @flow
import * as React from 'react'
import type {IconType} from '../../common-adapters/icon'
import type {Time} from '../../constants/types/rpc-gen'
import {Meta, NameWithIcon, Box, Text, Button, VBox, HBox, HeaderHoc} from '../../common-adapters'
import {globalStyles, globalColors, styleSheetCreate, collapseStyles} from '../../styles'

export type TimelineItem = {
  desc: string,
  subDesc?: string,
  type: 'LastUsed' | 'Added' | 'Revoked',
}

type Props = {
  currentDevice: boolean,
  deviceID: string,
  icon: IconType,
  name: string,
  onBack: () => void,
  revokeName: ?string,
  revokedAt?: ?Time,
  showRevokeDevicePage: () => void,
  timeline?: Array<TimelineItem>,
}

const TimelineMarker = ({first, last, closedCircle}) => (
  <Box style={collapseStyles([globalStyles.flexBoxColumn, {alignItems: 'center'}])}>
    <Box style={collapseStyles([styles.timelineLine, {height: 6, opacity: first ? 0 : 1}])} />
    <Box style={closedCircle ? styles.circleClosed : styles.circleOpen} />
    <Box style={collapseStyles([styles.timelineLine, {flex: 1, opacity: last ? 0 : 1}])} />
  </Box>
)

const TimelineLabel = ({desc, subDesc, subDescIsName, spacerOnBottom}) => (
  <VBox style={styles.timelineLabel}>
    <Text type="Body">{desc}</Text>
    {subDesc &&
      subDescIsName && (
        <Text type="BodySmall">
          by{' '}
          <Text type="BodySmall" style={styles.subDesc}>
            {subDesc}
          </Text>
        </Text>
      )}
    {subDesc && !subDescIsName && <Text type="BodySmall">{subDesc}</Text>}
    {spacerOnBottom && <Box style={{height: 15}} />}
  </VBox>
)

const Timeline = ({timeline}) =>
  timeline ? (
    <VBox centered={true}>
      {timeline.map(({type, desc, subDesc}, idx) => (
        <HBox key={desc} gap={16}>
          <TimelineMarker
            first={idx === 0}
            last={idx === timeline.length - 1}
            closedCircle={type === 'Revoked'}
          />
          <TimelineLabel
            spacerOnBottom={idx < timeline.length - 1}
            desc={desc}
            subDesc={subDesc}
            subDescIsName={['Added', 'Revoked'].includes(type)}
          />
        </HBox>
      ))}
    </VBox>
  ) : null

const Render = (props: Props) => {
  let metaOne
  if (props.currentDevice) {
    metaOne = 'Current device'
  } else if (props.revokedAt) {
    metaOne = <Meta title="REVOKED" style={styles.meta} />
  }

  return (
    <VBox fullHeight={true}>
      <VBox gap={15}>
        <NameWithIcon icon={props.icon} title={props.name} metaOne={metaOne} />
        <Timeline timeline={props.timeline} />
        {!props.revokedAt && (
          <Button
            type="Danger"
            label={`Revoke this ${props.revokeName || ''}`}
            onClick={props.showRevokeDevicePage}
          />
        )}
      </VBox>
    </VBox>
  )
}

const circleCommon = {
  borderRadius: 8 / 2,
  borderStyle: 'solid',
  borderWidth: 2,
  height: 8,
  width: 8,
}

const titleCommon = {
  fontStyle: 'italic',
  textAlign: 'center',
}

const styles = styleSheetCreate({
  circleClosed: {
    ...circleCommon,
    backgroundColor: globalColors.lightGrey2,
    borderColor: globalColors.white,
  },
  circleOpen: {
    ...circleCommon,
    borderColor: globalColors.lightGrey2,
  },
  meta: {
    alignSelf: 'center',
    backgroundColor: globalColors.red,
    marginTop: 4,
  },
  subDesc: {
    color: globalColors.black_75,
    fontStyle: 'italic',
  },
  timelineLabel: {alignItems: 'flex-start'},
  timelineLine: {
    backgroundColor: globalColors.lightGrey2,
    width: 2,
  },
  title: titleCommon,
  titleRevoked: {
    ...titleCommon,
    color: globalColors.black_40,
    textDecorationLine: 'line-through',
  },
})

export default HeaderHoc(Render)
