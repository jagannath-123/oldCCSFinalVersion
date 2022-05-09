import React from "react"
import { useState, useEffect } from "react"
import { findConfig, updateConfigs, getConfigs } from "../services/ccsServices"
import { useParams } from "react-router"
import SessionData from "../Components/SessionData"
import {
	FormField,
	Input,
	SpaceBetween,
	Button,
	Form,
	Header,
	Container,
	Select,
	Textarea,
} from "@amzn/awsui-components-react"

export default function Main() {
	const { id } = useParams()
	const [approver, setApprover] = useState("")
	const [remarks, setRemarks] = useState("")
	const [creator, setCreator] = useState("")
	const [msg, setMsg] = useState("Submitted")
	let Marketplaces = SessionData.getMarketPlace()

	console.log(
		"markeplaces",
		SessionData.getMarketPlace(),
		typeof Marketplaces,
		creator
	)

	const [selectedMarketplace, setSelectedMarketplace] = useState(
		Marketplaces[0]
	)

	const [merchant, setMerchant] = useState(0)
	const [ldap, setldap] = useState("")
	const [marketplace, setMarketplace] = useState("")

	// Adding request id and type;
	const [requestId, setRequestId] = useState("DARS-")
	const [type, setType] = useState("")
	const [count, setCount] = useState(0)

	useEffect(() => {
		setType(() => "Data Argument Setup Requests")
		if (id) {
			findConfig(id).then(raw => {
				const details = JSON.parse(raw.data.requestDetails)
				console.log(details)
				setMerchant(() => details["merchant"])
				setldap(() => details["ldap"])
				setMarketplace(() => details["marketplace"])
				// setstate(JSON.parse(raw.data.requestDetails))
				console.log("data", raw.data)
				setCreator(raw.data.creator)
				setRequestId(raw.data.requestId)
				setRemarks(raw.data.remarks)
			})
			setMsg("Updated")
		} else {
			getConfigs().then(raw => {
				raw.data.forEach(val => {
					console.log(val.type.trim())
					if (val.type.trim() === type) setCount(count => count + 1)
				})
			})
		}
	}, [id, type])
	useEffect(() => {
		if (creator === "")
			setCreator(creator => {
				return SessionData.getUser()
			})
	})

	const [showAlert, setShowAlert] = useState(false)
	const [showWarning, setShowWarning] = useState("")
	// console.log(state);

	useEffect(() => {
		if (!id) setRequestId(() => "DARS-" + (count + 1))
	}, [count, id])

	const submitDetails = status => {
		// TODO: update
		if (status === "Rejected" && remarks === "") {
			console.log(status)
			setShowWarning(() => "Need remarks for rejection")
			return
		}

		// TODO: Update
		if (status === "pending" && SessionData.getLevel() > 2) {
			console.log(status)
			alert("You cannot raise a Configuration")
			return
		}

		console.log(
			"id:",
			id,
			SessionData.getUser(),
			SessionData.isApprover(),
			SessionData.isApprover() ? approver : ""
		)
		// console.log(state)
		if (SessionData.isApprover() && status !== "pending") {
			console.log("setting approver")
			setApprover(() => SessionData.getUser())
		}
		const finalMarketplace =
			marketplace === "" ? selectedMarketplace.value : marketplace

		console.log("status", status)
		const result = updateConfigs(id, {
			requestId: requestId,
			type: type,
			requestDetails: JSON.stringify({
				merchant: merchant,
				ldap: ldap,
				marketplace: finalMarketplace,
				requireApprovel: SessionData.getLevel() < 2 ? true : false,
			}),
			status: status,
			creator: creator,
			approver: status !== "pending" ? SessionData.getUser() : "",
			remarks: remarks,
			date: new Date().toISOString(),
			url: "/dasr",
		})
		result.then(raw => {
			if (raw.data.message === "true") {
				setShowAlert(true)
			}
			console.log(raw.data)
		})
	}

	if (SessionData.getLevel() > 2 && !id)
		return (
			<div className="m-4 text-danger">
				<p>
					You are <strong>not allowed</strong> to create a
					Configuration as, you are an <strong>Resolver</strong>.
				</p>
			</div>
		)
	else
		return (
			<>
				{
					<div>
						{/* TODO: adding error text gor every form feild */}
						{/* TODO: To remove special case of "jaggu" */}
						{(SessionData.getLevel() < 3 && !id) ||
						(SessionData.getLevel() === 2 &&
							id &&
							creator === SessionData.getUser()) ? (
							<form onSubmit={e => e.preventDefault()}>
								<Form
									actions={
										<SpaceBetween
											direction="horizontal"
											size="xs"
										>
											<Button
												variant="primary"
												onClick={() =>
													submitDetails("pending")
												}
											>
												Submit
											</Button>
										</SpaceBetween>
									}
								>
									<Container
										header={
											<Header variant="h2">
												Data Augment Setup Requests{" "}
											</Header>
										}
									>
										<SpaceBetween
											direction="vertical"
											size="l"
										>
											<FormField
												stretch
												className="mb-3"
												label="Merchant"
												description="Enter merchant details, it should only contain numbers."
												errorText={
													merchant === 0
														? "Mandatory"
														: !Number.isInteger(
																merchant
														  )
														? "onlydigits"
														: ""
												}
											>
												<Input
													onChange={e => {
														if (
															e.detail.value ===
															""
														)
															setMerchant(() => 0)
														else
															setMerchant(
																parseInt(
																	e.detail
																		.value
																)
															)
													}}
													value={merchant}
												/>
											</FormField>

											<FormField
												stretch
												className="mb-3"
												label="Ldap"
												description="Enter Ldap group details"
												errorText={
													ldap === ""
														? "Mandatory"
														: ""
												}
											>
												<Input
													onChange={e => {
														setldap(e.detail.value)
													}}
													value={ldap}
												/>
											</FormField>
											<FormField
												stretch
												className="mb-3"
												label="Marketplace"
												description="Select marketplace"
												errorText={
													selectedMarketplace
														? ""
														: "Mandatory"
												}
											>
												<Select
													options={Marketplaces}
													selectedOption={
														selectedMarketplace
													}
													onChange={e => {
														setSelectedMarketplace(
															() =>
																e.detail
																	.selectedOption
														)
													}}
													selectedAriaLabel="Selected"
												/>
											</FormField>
											{id ? (
												<FormField
													stretch
													className="mb-3"
													label="Remarks"
													// TODO: update
													description="Add remarks if you want to tell the requestor"
													errorText={showWarning}
												>
													<Textarea
														readOnly
														disabled
														value={remarks}
													/>
												</FormField>
											) : (
												<></>
											)}
										</SpaceBetween>
									</Container>
								</Form>
							</form>
						) : SessionData.getLevel() === 1 && id ? (
							<form onSubmit={e => e.preventDefault()}>
								<Form
									actions={
										<SpaceBetween
											direction="horizontal"
											size="xs"
										>
											<Button
												variant="primary"
												onClick={() =>
													submitDetails("pending")
												}
											>
												Submit
											</Button>
										</SpaceBetween>
									}
								>
									<Container
										header={
											<Header variant="h2">
												Data Augment Setup Requests{" "}
											</Header>
										}
									>
										<SpaceBetween
											direction="vertical"
											size="l"
										>
											<FormField
												stretch
												className="mb-3"
												label="Merchant"
												errorText={
													merchant === ""
														? "Mandatory"
														: ""
												}
											>
												<Input
													onChange={e => {
														setMerchant(
															e.detail.value
														)
													}}
													value={merchant}
												/>
											</FormField>

											<FormField
												stretch
												className="mb-3"
												label="ldap"
												errorText={
													ldap === ""
														? "Mandatory"
														: ""
												}
											>
												<Input
													onChange={e => {
														setldap(e.detail.value)
													}}
													value={ldap}
												/>
											</FormField>
											<FormField
												stretch
												className="mb-3"
												label="Marketplace"
												errorText={
													selectedMarketplace
														? ""
														: "Mandatory"
												}
											>
												<Select
													options={Marketplaces}
													selectedOption={
														selectedMarketplace
													}
													onChange={e => {
														setSelectedMarketplace(
															() =>
																e.detail
																	.selectedOption
														)
													}}
													selectedAriaLabel="Selected"
												/>
											</FormField>
											{id ? (
												<FormField
													stretch
													className="mb-3"
													label="Remarks"
													// TODO: update
													description="Add remarks if you want to tell the requestor"
													errorText={showWarning}
												>
													<Textarea
														readOnly
														disabled
														value={remarks}
													/>
												</FormField>
											) : (
												<></>
											)}
										</SpaceBetween>
									</Container>
								</Form>
							</form>
						) : (
							<form onSubmit={e => e.preventDefault()}>
								<Form
									actions={
										<SpaceBetween
											direction="horizontal"
											size="xs"
										>
											<Button
												variant="primary"
												onClick={() =>
													submitDetails("Approved")
												}
											>
												Approve
											</Button>
											<Button
												formAction="none"
												variant="danger"
												onClick={() =>
													submitDetails("Rejected")
												}
											>
												Reject
											</Button>
										</SpaceBetween>
									}
								>
									<Container
										header={
											<Header variant="h2">
												Data Augment Setup Requests -{" "}
												<strong className="bg bg-secondary rounded bg-opacity-75 text text-light p-2 border border-secondary rounded">
													{requestId}
												</strong>{" "}
												<br /> <br />
												<p className="text-sm">
													Requestor -{" "}
													<a
														href={
															"https://phonetool.amazon.com/users/" +
															creator
														}
														target="_blank"
														rel="noreferrer"
													>
														<strong className="bg bg-secondary border border-secondary text-light p-1 rounded">
															{creator}
														</strong>
													</a>
												</p>
											</Header>
										}
									>
										<SpaceBetween
											direction="vertical"
											size="l"
										>
											<FormField
												stretch
												className="mb-3"
												label="Merchant"
											>
												<Input
													readOnly
													disabled
													value={merchant}
												/>
											</FormField>

											<FormField
												stretch
												className="mb-3"
												label="ldap"
											>
												<Input
													readOnly
													disabled
													value={ldap}
												/>
											</FormField>
											<FormField
												stretch
												className="mb-3"
												label="Marketplace"
											>
												<Input
													value={marketplace}
													readOnly
													disabled
												/>
											</FormField>
											<FormField
												stretch
												className="mb-3"
												label="Remarks"
												// TODO: update
												description="Add remarks if you want to tell the requestor"
												errorText={showWarning}
											>
												<Textarea
													onChange={e => {
														setRemarks(
															e.detail.value
														)
													}}
													value={remarks}
													placeholder="Provide here remarks here...."
												/>
											</FormField>
										</SpaceBetween>
									</Container>
								</Form>
							</form>
						)}
						{showAlert && (
							<div
								className="alert alert-success alert-dismissible fade show"
								role="alert"
							>
								<strong>{requestId}</strong> - Request {msg}{" "}
								Successfully
								<button
									type="button"
									className="btn-close"
									data-bs-dismiss="alert"
									aria-label="Close"
								></button>
							</div>
						)}
					</div>
				}
			</>
		)
}
