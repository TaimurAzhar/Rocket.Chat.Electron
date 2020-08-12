import { Button, ButtonGroup, Icon, Modal } from '@rocket.chat/fuselage';
import React from 'react';

const WarningModal = ({ text, confirmText, close, cancel, cancelText, confirm, ...props }) =>
	<Modal.Backdrop>
		<Modal { ...props }>
			<Modal.Header>
				<Icon color='danger' name='modal-warning' size={ 20 } />
				<Modal.Title>{ 'Are you sure' }</Modal.Title>
				<Modal.Close onClick={ close } />
			</Modal.Header>
			<Modal.Content fontScale='p1'>
				{ text }
			</Modal.Content>
			<Modal.Footer>
				<ButtonGroup align='end'>
					<Button ghost onClick={ cancel || close }>{ cancelText || 'Cancel' }</Button>
					<Button primary danger onClick={ confirm }>{ confirmText }</Button>
				</ButtonGroup>
			</Modal.Footer>
		</Modal>
	</Modal.Backdrop>;

export default WarningModal;
