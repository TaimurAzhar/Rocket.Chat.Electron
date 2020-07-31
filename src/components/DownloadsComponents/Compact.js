import React from 'react';
import { Box, Icon } from '@rocket.chat/fuselage';

import { Info, Progress, ActionButton } from '../../downloadUtils';

export default React.memo(function Compact({
	serverTitle,
	mime,
	date,
	fileName,
	fileSize,
	mbps,
	percentage,
	isCompleted,
	isPaused,
	isCancelled,
	handleFileOpen,
	handleCopyLink,
	handlePause,
	handleCancel,
	handleRetry,
	handleClear,
	...props
}) {
	<Box width='100%' display='flex' justifyContent='center' flexDirection='column' alignItems='center' { ...props }>
		<Box display='flex' flexGrow={ 1 } width='100%'>
			<Box fontScale='p1' withTruncatedText flexGrow={ 1 }>{ fileName }</Box>
			<Box display='flex' justifyContent='space-between' alignItems='center'>
				{/* <img src={ image } height='30px' width='30px' style={ { borderRadius: '5px' } } alt="" /> */ }
				{/* TODO INSERT TITLES FOR EACH ACTION */ }
				{/* Completed */ }
				{ isCompleted && <ActionButton onClick={ handleFileOpen }><Icon name='chevron-up' /></ActionButton> }
				{/* Progressing and Paused */ }
				{ !isCompleted && !isCancelled && <ActionButton onClick={ handlePause }>{ isPaused ? <Icon name='play' /> : <Icon name='pause' /> }</ActionButton> }
				{ !isCompleted && !isCancelled && <ActionButton onClick={ handleCancel }><Icon name='cross' /></ActionButton> }
				{/* Cancelled */ }
				{ isCancelled && <ActionButton onClick={ handleRetry }><Icon name='refresh' /></ActionButton> }
			</Box>
		</Box>
		<Box display='flex' flexGrow={ 1 } width='100%'>
			<Info withTruncatedText>{ serverTitle }</Info>
			<Info withTruncatedText mi='x8'>{ fileSize }</Info>
			{ mbps && <Info mi='x8'>{ `${ mbps }Mbps/s` }</Info> }
			<Progress percent={ percentage } mi='x8' />
			<Info withTruncatedText mi='x8'>{ date }</Info>
			{/* <Box display='flex' alignItems='center'>
			<Icon name='kebab'/> */}
			{/* </Box> */ }
		</Box>
	</Box>;
});

// export default React.memo(Compact);
