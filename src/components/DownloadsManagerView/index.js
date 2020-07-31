import { Box, Grid, SearchInput, Select, Icon, Button, Tabs } from '@rocket.chat/fuselage';
import { useLocalStorage, useMutableCallback } from '@rocket.chat/fuselage-hooks';
// import { useTranslation } from 'react-i18next';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { ipcRenderer, shell } from 'electron';

import { Wrapper } from './styles';
import DownloadItem from '../DownloadsComponents/DownloadItem';
import WarningModal from '../DownloadsComponents/WarningModal';
import { MIMES, DOWNLOAD_EVENTS } from '../../downloadUtils';


export function DownloadsManagerView() {
	const isVisible = useSelector(({ currentServerUrl }) => currentServerUrl === 'Downloads');
	const servers = useSelector(({ servers }) => servers);
	const serverOptions = [[1, 'All']];
	servers.map((server, index) => serverOptions.push([index + 2, server.title]));
	const fileTypes = [[1, 'All'], [2, 'Images'], [3, 'Videos'], [4, 'Audios'], [5, 'Texts'], [6, 'Files']];

	// Downloads Array
	const [modal, setModal] = useState();
	const [downloads, setDownloads] = useState([]);

	const [tab, setTab] = useLocalStorage('download-tab', 'All Downloads');
	const [searchVal, setSearchVal] = useState('');
	const [serverVal, setServerVal] = useLocalStorage('download-server', '');
	const [typeVal, setTypeVal] = useLocalStorage('download-type', '');
	const [layout, setLayout] = useLocalStorage('download-layout', 'expanded');
	let timeHeading;

	const handleFileOpen = useMutableCallback((path) => {
		// console.log(path);
		shell.showItemInFolder(path);
	});

	const handleTabChange = useMutableCallback((event) => {
		// console.log(event.target.innerText);
		if (event.target.innerText !== tab) {
			setTab(event.target.innerText);
		}
	});

	const handleLayout = useMutableCallback(() => {
		if (layout === 'compact') {
			setLayout('expanded');
		} else {
			setLayout('compact');
		}
	});


	const handleSearch = useMutableCallback((event) => {
		// console.log(Boolean(event.target.value));
		if (event.target.value !== searchVal) {
			setSearchVal(event.target.value);
		}
	});

	const handleServerFilter = useMutableCallback((index) => {
		console.log(index);
		if (serverOptions[index - 1][1] !== serverVal) {
			setServerVal(serverOptions[index - 1][1]);
		}
	});

	const handleMimeFilter = useMutableCallback((index) => {
		console.log(index);
		if (fileTypes[index - 1][1] !== typeVal) {
			setTypeVal(fileTypes[index - 1][1]);
		}
	});


	const updateDownloads = useMutableCallback((data) => {
		console.log(data);
		const updatedDownloads = downloads.map((downloadItem) => {
			if (downloadItem.itemId === data.itemId) {
				for (const key of Object.keys(data)) {
					downloadItem[key] = data[key];
				}
			}
			return downloadItem;
		});
		setDownloads(updatedDownloads);
	});

	// Modal Actions

	const closeModal = useCallback(() => {
		setModal(null);
	}, [setModal]);


	const handleClearAll = useCallback(() => {
		// Remove All downloads from list
		const clearAll = () => {
			closeModal();
			ipcRenderer.send(DOWNLOAD_EVENTS.RESET);
		};

		setModal(
			<WarningModal
				close={ closeModal }
				cancel={ closeModal }
				confirm={ clearAll }
				confirmText={ 'Remove All' }
				text={ 'Are you sure you want to remove all downloads?' }
			/>);
	}, [closeModal, setModal]);

	// Remove a single download from list

	const handleClear = useMutableCallback((itemId) => {
		const clear = () => {
			const newDownloads = downloads.filter((download) => download.itemId !== itemId);
			setDownloads(newDownloads);
			ipcRenderer.send(DOWNLOAD_EVENTS.REMOVE, itemId);
		};

		setModal(
			<WarningModal
				close={ closeModal }
				cancel={ closeModal }
				confirm={ clear }
				confirmText={ 'Remove' }
				text={ 'Are you sure you want to remove this item?' }
			/>);
	}, [closeModal, setModal]);


	// 			USE EFFECTS

	useEffect(() => {
		console.log('Loading Downloads');
		ipcRenderer.send(DOWNLOAD_EVENTS.LOAD);
	}, []);

	useEffect(() => {
		const intializeDownloads = (event, downloads) => {
			setDownloads(Object.values(downloads));
			console.log(Object.values(downloads));
		};
		ipcRenderer.on(DOWNLOAD_EVENTS.INITIALIZE, intializeDownloads);
		return () => {
			ipcRenderer.removeListener(DOWNLOAD_EVENTS.INITIALIZE, intializeDownloads);
		};
	}, []);

	useEffect(() => {
		const createDownload = (event, props) => {
			console.log('Creating New Download');
			console.log(props);
			const updatedDownloads = [...downloads];
			updatedDownloads.push(props);
			setDownloads(updatedDownloads);
		};
		ipcRenderer.on(DOWNLOAD_EVENTS.CREATE, createDownload);
		return () => {
			ipcRenderer.removeListener(DOWNLOAD_EVENTS.CREATE, createDownload);
		};
	}, [downloads]);


	const filteredDownloads = useMemo(() => {
		const searchRegex = searchVal && new RegExp(`${ searchVal }`, 'gi');
		return downloads.filter((download) => (!searchRegex || searchRegex.test(download.fileName)) && (tab === 'All Downloads' || download.status === tab) && (!serverVal || serverVal === 'All' || serverVal === download.serverTitle) && (!typeVal || typeVal === 'All' || MIMES[download.mime.split('/')[0]] === typeVal)).sort((a, b) => b.itemId - a.itemId);
	}, [searchVal, downloads, tab, serverVal, typeVal]);


	return <>
		<Wrapper isVisible={ isVisible }>
			<Box p='x24'>

				<Grid xl={ true } >
					<Grid.Item xl={ 10 }>
						<Box>
							<Box fontSize='x32' lineHeight='2'>Downloads</Box>
							<Box fontSize='x20' lineHeight='2' color='info'>See all your downloads here</Box>
						</Box>
					</Grid.Item>

					<Grid.Item xl={ 12 }>
						<Tabs>
							<Tabs.Item selected={ tab === 'All Downloads' } onClick={ handleTabChange }>All Downloads</Tabs.Item>
							<Tabs.Item selected={ tab === 'Paused' } onClick={ handleTabChange }>Paused</Tabs.Item>
							<Tabs.Item selected={ tab === 'Cancelled' } onClick={ handleTabChange }>Cancelled</Tabs.Item>
						</Tabs>
					</Grid.Item>

					<Grid.Item xl={ 12 } style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }>
						<Grid.Item xl={ 3 } sm={ 2 } >
							<SearchInput width='150px' onChange={ handleSearch } placeholder='Search' addon={ <Icon name='send' size='x20' /> } />
						</Grid.Item>

						<Grid.Item xl={ 3 } sm={ 2 } >
							<Select width='100%' onChange={ handleServerFilter } placeholder='Filter by Server' options={ serverOptions } />

						</Grid.Item>

						<Grid.Item xl={ 2 } sm={ 2 } >
							<Select width='100%' onChange={ handleMimeFilter } placeholder='Filter by File type' options={ fileTypes } />
						</Grid.Item>

						<Grid.Item xl={ 1 } sm={ 1 } >
							<Box width='100%' textAlign='end'>
								<Button title={ 'Change View' } ghost onClick={ handleLayout }>
									<Icon name='medium-view' size='x32' />
									{/* <Box>Change View</Box> */ }
								</Button>
							</Box>

						</Grid.Item>

						<Grid.Item xl={ 1 } sm={ 1 } >
							<Button title={ 'Clear All Downloads' } ghost onClick={ handleClearAll }>
								<Icon name='trash' size='x32' />
								{/* <Box>Delete All</Box> */ }
							</Button>
						</Grid.Item>
					</Grid.Item>

					<Grid.Item xl={ 12 } style={ { display: 'flex', flexDirection: 'column', alignItems: 'center' } }>
						{/* Download Item List */ }
						{ filteredDownloads.map((downloadItem) => {
							// Condition for Data Headings
							if (!timeHeading) {
								timeHeading = new Date(downloadItem.itemId).toDateString();
							} else if (timeHeading === new Date(downloadItem.itemId).toDateString()) {
								return <DownloadItem { ...downloadItem } updateDownloads={ updateDownloads } key={ downloadItem.itemId } layout={ layout } handleFileOpen={ handleFileOpen } handleClear={ handleClear } />;
							}
							timeHeading = new Date(downloadItem.itemId).toDateString();
							return (
								<>
									<Box fontSize='x16' color='info' alignSelf='start'>{ timeHeading }</Box>
									<DownloadItem mb='x16' { ...downloadItem } updateDownloads={ updateDownloads } key={ downloadItem.itemId } layout={ layout } handleFileOpen={ handleFileOpen } handleClear={ handleClear } />
								</>
							);
						}) }
					</Grid.Item>

				</Grid>
			</Box>
		</Wrapper>{ modal }
	</>;
}
