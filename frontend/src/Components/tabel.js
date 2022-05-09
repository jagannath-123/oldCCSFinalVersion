/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
/* eslint-disable array-callback-return */

import { CSVLink } from "react-csv"
import jsPDF from "jspdf"
import "jspdf-autotable"

import "../App.css"
// import "../App.css"

import React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { deleteConfig, getConfigs } from "../services/ccsServices"
import SessionData from "./SessionData"

import {
	Form,
	Container,
	SpaceBetween,
	Input,
	FormField,
	TextFilter,
	Pagination,
	Header,
	CollectionPreferences,
	Cards,
	Box,
	Button,
	Icon,
	Textarea,
	DateRangePicker,
} from "@amzn/awsui-components-react/polaris"

import Table from "@amzn/awsui-components-react/polaris/table"
import { useCollection } from "@amzn/awsui-collection-hooks"

import {
	isWithinInterval,
	addHours,
	addSeconds,
	addMinutes,
	addWeeks,
	addMonths,
	addYears,
	addDays,
} from "date-fns"

// this will display the counts of each section like pending, my configs, etc....
const CountRows = (result, user, isApprover, level) => {
	var totalCount = 0
	var pendingCount = 0
	var myconfigCount = 0
	result.data.forEach(val => {
		console.log(val.creator === user && val.status === "pending")
		if (isApprover) {
			val.requestDetails = JSON.parse(val.requestDetails)
			if (
				SessionData.getLevel() > 2 ||
				val.requestDetails.requireApprovel === true
			)
				myconfigCount++
		} else if (val.creator === user && val.status === "pending")
			pendingCount++
		if (val.creator === user) totalCount++
	})
	console.log([totalCount, pendingCount, myconfigCount])
	return [totalCount, pendingCount, myconfigCount]
}

// this will create the main table

export default function ConfigurationTable(type) {
	const [rawData, setrawData] = useState([])
	const [totalCount, setTotalCount] = useState(0)
	const [pendingCount, setPendingCount] = useState(0)
	const [completedCount, setCompletedCount] = useState(
		totalCount - pendingCount
	)
	const [myCount, setMyCount] = useState(0)
	const [selectedRow, setSelectedRow] = useState({})

	// Date Filter
	const [value, setValue] = React.useState(undefined)
	const [rangeFilter, setRangeFilter] = useState(null)

	// This function will refresh the data present in the table after changes.
	const refreshTable = rangeFilter => {
		console.log("isapprover", SessionData.isApprover())
		setrawData(() => [])
		getConfigs().then(result => {
			const counts = CountRows(
				result,
				SessionData.getUser(),
				SessionData.isApprover(),
				SessionData.getLevel()
			)
			setTotalCount(() => counts[0])
			setPendingCount(() => counts[1])
			setCompletedCount(() => counts[0] - counts[1])
			setMyCount(() => counts[2])
			console.log("range filter", rangeFilter)
			result.data.forEach(row => {
				if (rangeFilter && rangeFilter !== null) {
					const range = convertToAbsoluteRange(rangeFilter)
					console.log(isWithinInterval(new Date(row.date), range))
					if (!isWithinInterval(new Date(row.date), range)) {
						return
					}
				}
				row.date =
					new Date(row.date).toDateString() +
					" - " +
					new Date(row.date).toTimeString()
				if (
					type !== "myconfig" &&
					row.creator === SessionData.getUser()
				) {
					row.requestDetails = JSON.parse(row.requestDetails)
					row.option = Option(row)
					row.view = Preview(row)
					setrawData(rawData => [...rawData, row])
				} else if (type === "myconfig" && SessionData.getLevel() > 2) {
					// row.requestDetails = JSON.parse(JSON.stringify(row.requestDetails))
					row.option = Approval(row)
					row.view = Preview(row)
					setrawData(rawData => [...rawData, row])
				} else if (type === "myconfig" && SessionData.getLevel() > 1) {
					// console.log(row.requestDetails)
					row.requestDetails = JSON.parse(
						JSON.stringify(row.requestDetails)
					)
					row.option = Approval(row)
					row.view = Preview(row)
					if (row.requestDetails.requireApprovel == true)
						setrawData(rawData => [...rawData, row])
				}
				if (row.remarks === "") row.remarks = "NA"
			})
		})
	}

	// this fucntion will add Edit and Delete options column
	const Option = row => {
		const handleDelete = async () => {
			await deleteConfig(row._id)
			refreshTable()
		}

		return (
			<div>
				{row.status !== "Approved" && (
					<div className="row">
						<Link className="col-6" to={row.url + "/" + row._id}>
							<Button variant="primary">
								<Icon name="edit" size="normal" />
							</Button>
						</Link>
						<div className="col-1"></div>
						<div className="col-4">
							<Button onClick={handleDelete}>
								<Icon
									name="close"
									size="normal"
									variant="error"
								/>
							</Button>
						</div>
					</div>
				)}
				{row.status === "Approved" && (
					<strong>No More changes to be done</strong>
				)}
			</div>
		)
	}

	// this function will add an option to open and approve the Configuration
	const Approval = row => {
		return (
			<div className="row">
				<Link to={row.url + "/" + row._id}>
					<Button variant="primary">Approve/Reject</Button>
				</Link>
			</div>
		)
	}

	useEffect(() => {
		refreshTable(null)
	}, [type])

	const [data, setdata] = useState([])

	// this will modify data when we cnage condition like pending, completed, my configs
	useEffect(() => {
		setdata(() => [])
		if (type == "Completed") {
			rawData.forEach(val => {
				if (val.status !== "pending") {
					console.log(val)
					setdata(data => [...data, val])
				}
			})
		} else if (type == "pending") {
			rawData.map(val => {
				if (val.status == "pending") {
					setdata(data => [...data, val])
				}
			})
		} else {
			setdata(() => rawData)
		}
	}, [rawData, type])

	//  this is to show the preview in expansion
	const DisplayElement = (key, value) => {
		if (key === "requireApprovel") return <></>
		if (key === "remarks")
			return (
				<FormField
					key={key + value}
					stretch
					className="mb-3"
					label={key}
				>
					<Textarea readOnly value={value} />
				</FormField>
			)
		else
			return (
				<FormField
					key={key + value}
					stretch
					className="mb-3"
					label={key}
				>
					<Input readOnly value={value} />
				</FormField>
			)
	}
	const PreviewDetails = details => {
		const [displayData, setDisplayData] = useState([])
		const isEmpty = Object.keys(details).length === 0
		useEffect(() => {
			if (!isEmpty) {
				setDisplayData(() => [])
				for (var i in details.requestDetails) {
					const key = i,
						value = details.requestDetails[i]
					console.log("key-value", key, value)
					setDisplayData(displayData => [
						...displayData,
						DisplayElement(key, value),
					])
				}
				setDisplayData(displayData => [
					...displayData,
					DisplayElement("remarks", details.remarks),
				])
			}
		}, [details])

		return (
			<div className="m-3 p-2">
				{!isEmpty && (
					<form onSubmit={e => e.preventDefault()}>
						<Form>
							<Container
								header={
									<Header variant="h2">
										{details.type + " - "}
										<strong className="bg bg-secondary rounded bg-opacity-75 text text-light fs-6 p-1 border border-secondary">
											{details.requestId}
										</strong>{" "}
										<br /> <br />
										<p className="text-sm">
											Requestor -{" "}
											<a
												href={
													"https://phonetool.amazon.com/users/" +
													details.creator
												}
												target="_blank"
												rel="noreferrer"
											>
												<strong>
													{details.creator}
												</strong>
											</a>
											<br />
											Last Updated Date:{"  "}
											{details.date}
										</p>
									</Header>
								}
							>
								<SpaceBetween direction="vertical" size="l">
									{displayData}
								</SpaceBetween>
							</Container>
						</Form>
					</form>
				)}
			</div>
		)
	}
	const Preview = row => {
		return (
			<Button
				className="border border-dark rounded"
				onClick={() => {
					setSelectedRow(() => {
						return {}
					})
					setSelectedRow(() => {
						return row
					})
				}}
			>
				<Icon
					svg={
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
						>
							<path d="M15 12c0 1.654-1.346 3-3 3s-3-1.346-3-3 1.346-3 3-3 3 1.346 3 3zm9-.449s-4.252 8.449-11.985 8.449c-7.18 0-12.015-8.449-12.015-8.449s4.446-7.551 12.015-7.551c7.694 0 11.985 7.551 11.985 7.551zm-7 .449c0-2.757-2.243-5-5-5s-5 2.243-5 5 2.243 5 5 5 5-2.243 5-5z" />
						</svg>
					}
				/>
			</Button>
		)
	}

	// Exporting as PDF
	const exportPDF = () => {
		const unit = "pt"
		const size = "A4" // Use A1, A2, A3 or A4
		const orientation = "portrait" // portrait or landscape

		const marginLeft = 40
		const doc = new jsPDF(orientation, unit, size)

		doc.setFontSize(15)

		const title = "Configurations"
		const headers = [
			["Request Id", "Type", "Status", "Approver", "Date", "Remarks"],
		]

		const rows = data.map(row => [
			row.requestId,
			row.type,
			row.status,
			row.approver,
			row.date,
			row.remarks,
		])

		let content = {
			startY: 50,
			head: headers,
			body: rows,
		}

		doc.text(title, marginLeft, 40)
		doc.autoTable(content)
		doc.save("report.pdf")
	}

	// Table
	const [preferences, setPreferences] = useState({
		pageSize: 10,
		visibleContent: [
			"requestId",
			"type",
			"status",
			"approver",
			"date",
			"remarks",
			"options",
			"preview",
		],
	})

	const COLUMN_DEFINITIONS = [
		{
			id: "requestId",
			sortingField: "requestId",
			header: "Request Id",
			cell: row => row.requestId,
			width: 20,
		},
		{
			id: "type",
			sortingField: "type",
			header: "Type",
			cell: row => row.type,
			width: 100,
		},
		{
			id: "status",
			sortingField: "status",
			header: "Status",
			cell: row => row.status,
			width: 50,
		},
		{
			id: "approver",
			sortingField: "approver",
			header: "Approver",
			cell: row => row.approver,
			maxWidth: 100,
		},
		{
			id: "date",
			sortingField: "date",
			header: "Date",
			cell: Item => Item.date,
			maxWidth: 180,
		},
		{
			id: "remarks",
			sortingField: "remarks",
			header: "Remarks",
			cell: row => row.remarks,
			maxWidth: 100,
		},
		{
			id: "options",
			header: type !== "myconfig" ? "Edit/Delete" : "Options",
			cell: row => row.option,
			minWidth: 200,
		},

		{
			id: "preview",
			header: "Preview",
			cell: row => row.view,
			width: 100,
		},
	]

	const EmptyTableMessage = message => {
		return <Box>{message}</Box>
	}

	const SEARCHABLE_COLUMNS = [
		"requestId",
		"type",
		"status",
		"approver",
		"date",
		"remarks",
	]
	const {
		items,
		filteredItemsCount,
		collectionProps,
		filterProps,
		paginationProps,
	} = useCollection(data, {
		filtering: {
			empty: EmptyTableMessage("No recordsss found.."),
			noMatch: EmptyTableMessage("No results matches the search.."),
			filteringFunction: (item, filteringText) => {
				if (rangeFilter !== null) {
					const range = convertToAbsoluteRange(rangeFilter)
					if (!isWithinInterval(new Date(item.date), range)) {
						return false
					}
				}

				const filteringTextLowerCase = filteringText.toLowerCase()

				return SEARCHABLE_COLUMNS.map(key => item[key]).some(
					value =>
						typeof value === "string" &&
						value.toLowerCase().indexOf(filteringTextLowerCase) > -1
				)
			},
		},
		pagination: { pageSize: preferences.pageSize },
		sorting: {},
		selection: {},
	})

	const MyCollectionPreferences = ({ prefernces, setPreferences }) => {
		return (
			<CollectionPreferences
				title="Preferences"
				confirmLabel="Confirm"
				cancelLabel="cancel"
				preferences={prefernces}
				onConfirm={({ detail }) => setPreferences(detail)}
				pageSizePreference={{
					title: "Requests per page",
					options: [
						{ value: 10, label: "10 per page" },
						{ value: 30, label: "30 per page" },
						{ value: 40, label: "50 per page" },
					],
				}}
				wrapLinesPreference={{
					label: "Wrap lines in table",
					description: "Wrap lines for columns having long text",
				}}
				visibleContentPreference={{
					title: "Select preferred columns that should be visible in the table",
					options: [
						{
							label: "Request Details",
							options: [
								{ id: "requestId", label: "Request Number" },
								{ id: "type", label: "Request Type" },
								{
									id: "status",
									label: "Status of the request",
								},
								{ id: "approver", label: "approver names" },
								{ id: "date", label: "date of update" },
								{
									id: "remarks",
									label: "remarks given by resolver",
								},
								{
									id: "options",
									label: "operations on congfiguration",
								},
								{
									id: "preview",
									label: "preview the configuration",
								},
							],
						},
					],
				}}
			/>
		)
	}

	// Date Filter.....
	const differenceInDays = (dateOne, dateTwo) => {
		const milliseconds = Math.abs(new Date(dateTwo) - new Date(dateOne))
		const days = Math.ceil(milliseconds / (1000 * 60 * 60 * 24))
		return days
	}
	const lengthInDays = (unit, amount) => {
		switch (unit) {
			case "second":
				return amount / (24 * 60 * 60)
			case "minute":
				return amount / (24 * 60)
			case "hour":
				return amount / 24
			case "day":
				return amount
			case "week":
				return amount * 7
			case "month":
				return amount * 30
			case "year":
				return amount * 365
			default:
				return amount
		}
	}

	const isValidRangeFunction = range => {
		if (range.type === "absolute") {
			const [startDateWithoutTime] = range.startDate.split("T")
			const [endDateWithoutTime] = range.endDate.split("T")

			if (!startDateWithoutTime || !endDateWithoutTime) {
				return {
					valid: false,
					errorMessage:
						"The selected date range is incomplete. Select a start and end date for the date range.",
				}
			}

			if (differenceInDays(range.startDate, range.endDate) >= 366) {
				return {
					valid: false,
					errorMessage:
						"The selected date range is too large. Select a range up to one year.",
				}
			}

			if (differenceInDays(range.startDate, range.endDate) < 2) {
				return {
					valid: false,
					errorMessage:
						"The selected date range is too small. Select a range larger than one day.",
				}
			}
		} else if (range.type === "relative") {
			if (isNaN(range.amount)) {
				return {
					valid: false,
					errorMessage:
						"The selected date range is incomplete. Specify a duration for the date range.",
				}
			}

			if (lengthInDays(range.unit, range.amount) < 2) {
				return {
					valid: false,
					errorMessage:
						"The selected date range is too small. Select a range larger than one day.",
				}
			}

			if (lengthInDays(range.unit, range.amount) >= 366) {
				return {
					valid: false,
					errorMessage:
						"The selected date range is too large. Select a range up to one year.",
				}
			}
		}
		return refreshTable(range)
	}
	function convertToAbsoluteRange(range) {
		if (range.type === "absolute") {
			return {
				start: new Date(range.startDate),
				end: new Date(range.endDate),
			}
		} else {
			const now = new Date()
			const start = (() => {
				switch (range.unit) {
					case "second":
						return addSeconds(now, -range.amount)
					case "minute":
						return addMinutes(now, -range.amount)
					case "hour":
						return addHours(now, -range.amount)
					case "day":
						return addDays(now, -range.amount)
					case "week":
						return addWeeks(now, -range.amount)
					case "month":
						return addMonths(now, -range.amount)
					case "year":
						return addYears(now, -range.amount)
					default:
						return addSeconds(now, -range.amount)
				}
			})()
			return {
				start: start,
				end: now,
			}
		}
	}

	const myApprovals =
		SessionData.getLevel() > 2 ? "My Configs" : "My Approvals"

	return (
		<>
			<div>
				<br />

				<Cards
					ariaLabels={{
						itemSelectionLabel: (e, t) => `select ${t.name}`,
						selectionGroupLabel: "Item selection",
					}}
					cardDefinition={{
						header: item => (
							<Link
								to={item.link}
								className={"fw-bold text-dark"}
								fontSize="heading-m"
							>
								{item.name}
							</Link>
						),
						sections: [
							{
								id: "description",
								header: "",
								content: item => item.description,
							},
						],
					}}
					cardsPerRow={[{ cards: 1 }, { minWidth: 500, cards: 4 }]}
					items={[
						{
							name: "Total",
							alt: "First",
							description: "Count: " + totalCount,
							link: "/",
							color: "primary",
						},
						{
							name: "Pending",
							alt: "Second",
							description: "Count: " + pendingCount,
							link: "/home/pending",
							color: "danger",
						},
						{
							name: "Completed",
							alt: "Third",
							description: "Count: " + completedCount,
							link: "/home/Completed",
							color: "success",
						},
						{
							name: myApprovals,
							alt: "Fourth",
							description: "Count: " + myCount,
							link: "/home/myconfig",
							color: "warning",
						},
					]}
					loadingText="Loading resources"
					empty={
						<Box textAlign="center" color="inherit">
							<b>No resources</b>
							<Box
								padding={{ bottom: "s" }}
								variant="p"
								color="inherit"
							>
								No resources to display.
							</Box>
							<Button>Create resource</Button>
						</Box>
					}
					className="m-3"
				/>
			</div>
			{SessionData.getLevel() < 2 && type === "myconfig" ? (
				<div className="m-4 text-danger">
					<p>
						You are <strong>not allowed</strong> to access this as,
						you are an <strong>Requestor</strong>. This is only for{" "}
						<strong>Resolvers</strong>.
					</p>
				</div>
			) : SessionData.getLevel() > 2 && type !== "myconfig" ? (
				<div className="m-4 text-danger">
					<p>
						You are <strong>not allowed</strong> to access this as,
						you are an <strong>Resolver</strong>. This is only for{" "}
						<strong>Requestors</strong>.
					</p>
				</div>
			) : (
				<>
					<div className="row">
						<DateRangePicker
							className="col"
							onChange={({ detail }) => setValue(detail.value)}
							value={value}
							isValidRange={isValidRangeFunction}
							expandToViewport={true}
							relativeOptions={[
								{
									key: "Last-1-Month",
									amount: 1,
									unit: "month",
									type: "relative",
								},
								{
									key: "Last-3-Months",
									amount: 3,
									unit: "month",
									type: "relative",
								},
								{
									key: "Last-6-Months",
									amount: 6,
									unit: "month",
									type: "relative",
								},
								{
									key: "Last-Year",
									amount: 1,
									unit: "year",
									type: "relative",
								},
							]}
							i18nStrings={{
								todayAriaLabel: "Today",
								nextMonthAriaLabel: "Next month",
								previousMonthAriaLabel: "Previous month",
								customRelativeRangeDurationLabel: "Duration",
								customRelativeRangeDurationPlaceholder:
									"Enter duration",
								customRelativeRangeOptionLabel: "Custom range",
								customRelativeRangeOptionDescription:
									"Set a custom range in the past",
								// customRelativeRangeUnitLabel: "Unit of time",
								formatRelativeRange: e => {
									const t =
										1 === e.amount ? e.unit : `${e.unit}s`
									return `Last ${e.amount} ${t}`
								},
								formatUnit: (e, t) => (1 === t ? e : `${e}s`),
								dateTimeConstraintText:
									"Range must be between 6 and 30 days. Use 24 hour format.",
								relativeModeTitle: "Relative range",
								absoluteModeTitle: "Absolute range",
								relativeRangeSelectionHeading: "Choose a range",
								startDateLabel: "Start date",
								endDateLabel: "End date",
								startTimeLabel: "Start time",
								endTimeLabel: "End time",
								clearButtonLabel: "Clear and dismiss",
								cancelButtonLabel: "Cancel",
								applyButtonLabel: "Apply",
							}}
							dateOnly
							placeholder="Filter by a date and time range"
						/>
						<div className="col-6"></div>
						<div class=" col-2 dropdown">
							<button
								class="btn btn-light border border-dark rounded dropdown-toggle m-1"
								type="button"
								id="dropdownMenuButton1"
								data-bs-toggle="dropdown"
								aria-expanded="false"
							>
								Download
							</button>
							<ul
								className="dropdown-menu"
								aria-labelledby="dropdownMenuButton1"
							>
								<li className="m-1 d-flex justify-content-center">
									<button
										className="dropdown-item"
										onClick={() => exportPDF()}
									>
										PDF
									</button>
								</li>
								<li className="m-1 d-flex justify-content-center">
									<CSVLink
										data={data}
										filename={
											"My-Configurations" + type + ".csv"
										}
										className="dropdown-item"
										href=""
										target="_blank"
										headers={[
											{
												label: "Request Id",
												key: "requestId",
												width: 50,
											},
											{
												label: "Type",
												key: "type",
												width: 100,
											},
											{
												label: "Status",
												key: "status",
												width: 50,
											},
											{
												label: "Approver",
												key: "approver",
												width: 50,
											},
											{
												label: "Date",
												key: "date",
												width: 50,
												sortingField: "date",
											},
											{
												label: "Remarks",
												key: "remarks",
												width: 150,
											},
										]}
									>
										CSV
									</CSVLink>
								</li>
							</ul>
						</div>
					</div>

					<Table
						{...collectionProps}
						header={
							<Header
								counter={
									collectionProps.selectedItems.length
										? `(${collectionProps.selectedItems.length}/${data.length})`
										: `(${data.length})`
								}
								variant="h2"
							>
								Configurations{" "}
							</Header>
						}
						className="actual-table"
						columnDefinitions={COLUMN_DEFINITIONS}
						visibleColumns={preferences.visibleContent}
						items={items}
						filter={
							<div>
								<TextFilter
									{...filterProps}
									filteringPlaceholder="Find in table.."
									countText={filteredItemsCount}
								/>
							</div>
						}
						pagination={<Pagination {...paginationProps} />}
						preferences={
							<MyCollectionPreferences
								preferences={preferences}
								setPreferences={setPreferences}
							/>
						}
						empty={EmptyTableMessage("No records Found...")}
					/>
				</>
			)}
			{/* Preview of row */}
			<div className="bg bg-light text-dark m-3 p-3">
				<hr />
				{PreviewDetails(selectedRow)}
			</div>
		</>
	)
}
