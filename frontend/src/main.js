import React, { Component, useEffect } from "react"
import { useState } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AppLayout } from "@amzn/awsui-components-react/polaris"

// pages
import AboutUs from "./Components/aboutUs"
import HomePage from "./Components/homepage"
import SessionData from "./Components/SessionData"
import UserGuide from "./Components/userGuide"

// Configs
import DataAugmenterSetupRequests from "./Configurations/DataAugmenterSetupRequests"
import OLSConfiguration from "./Configurations/OLSConfiguration"
import MerchantMarketplaceVendorCreation from "./Configurations/MerchantMarketplaceVendorCreation"
import BrandCodeUpdateRequest from "./Configurations/BrandCodeUpdateRequest"
import MiscMetadataRequests from "./Configurations/MiscMetadataRequests"
import AVSConfiguration from "./Configurations/AVSConfiguration"
import IMSClientTokenAndThrottleConfigurationRequests from "./Configurations/IMSClientTokenAndThrottleConfigurationRequests"
import VariationDimensionSorting from "./Configurations/VariationDimentionSorting"
import ORCSConfigurationChanges from "./Configurations/ORCSConfigurationChanges"
import ManagerApproval from "./Configurations/ManagerApproval"

// Side Bar
import { SideNavigation } from "@amzn/awsui-components-react/polaris"

//TOP NAVBAR
import TopNavigation from "@amzn/awsui-components-react/polaris/top-navigation"
import { getDate, getUser, isApprover } from "./services/ccsServices"

import amazonLogo from "./static/amazon_logo_RGB_REV.png"

const schduleImg = () => {
	return (
		<img
			src="https://badges.corp.amazon.com/oncall/catalog-configuration-support.svg?w=.png"
			alt=""
		/>
	)
}

export default function Main() {
	const [cookies, setCookies] = useState({
		username: "",
		marketplaces: [],
		isApprover: "",
		level: -1,
	})
	useEffect(() => {
		getUser().then(async raw => {
			setCookies(cookies => {
				return {
					...cookies,
					username: raw.data["username"],
				}
			})
			console.log(raw.data["marketplaces"][0])
			let temp = []
			raw.data["marketplaces"].map(val => {
				console.log(val)
				temp.push(val)
			})
			setCookies(cookies => {
				return { ...cookies, marketplaces: temp }
			})
			setTimeout(() => {}, 5000)

			isApprover(raw.data["username"]).then(async RAW => {
				console.log(
					"navbar-isApprover:",
					RAW.data.message ? "non zero" : "zero"
				)
				setCookies(cookies => {
					return {
						...cookies,
						isApprover: RAW.data.message > 1 ? true : false,
					}
				})
				setCookies(cookies => {
					return {
						...cookies,
						level: RAW.data.message,
					}
				})
			})
		})
	}, [])
	// useEffect(() => {
	SessionData.setUser(cookies["username"])
	SessionData.setApprover(cookies["isApprover"])
	SessionData.setMarketPlace(cookies["marketplaces"])
	SessionData.setLevel(cookies["level"])
	// }, [cookies])

	const Content = () => {
		return (
			<div id="content">
				<Routes>
					<Route path="/home/:status" element={<HomePage />} />{" "}
					<Route path="/aboutus" element={<AboutUs />} />{" "}
					<Route path="/userguide" element={<UserGuide />} />
					<Route
						path="/dasr"
						element={<DataAugmenterSetupRequests />}
					/>{" "}
					<Route
						path="/dasr/:id"
						element={<DataAugmenterSetupRequests />}
					/>
					<Route path="/ols" element={<OLSConfiguration />} />{" "}
					<Route path="/ols/:id" element={<OLSConfiguration />} />
					<Route
						path="/mmv"
						element={<MerchantMarketplaceVendorCreation />}
					/>{" "}
					<Route
						path="/mmv/:id"
						element={<MerchantMarketplaceVendorCreation />}
					/>
					<Route path="/bc" element={<BrandCodeUpdateRequest />} />{" "}
					<Route
						path="/bc/:id"
						element={<BrandCodeUpdateRequest />}
					/>
					<Route path="/mmr" element={<MiscMetadataRequests />} />{" "}
					<Route path="/mmr/:id" element={<MiscMetadataRequests />} />
					<Route path="/avs" element={<AVSConfiguration />} />{" "}
					<Route path="/avs/:id" element={<AVSConfiguration />} />
					<Route
						path="/imsclient"
						element={
							<IMSClientTokenAndThrottleConfigurationRequests />
						}
					/>{" "}
					<Route
						path="/imsclient/:id"
						element={
							<IMSClientTokenAndThrottleConfigurationRequests />
						}
					/>
					<Route
						path="/vds"
						element={<VariationDimensionSorting />}
					/>{" "}
					<Route
						path="/vds/:id"
						element={<VariationDimensionSorting />}
					/>
					<Route
						path="/orcs"
						element={<ORCSConfigurationChanges />}
					/>{" "}
					<Route
						path="/orcs/:id"
						element={<ORCSConfigurationChanges />}
					/>
					<Route path="/ma" element={<ManagerApproval />} />{" "}
					<Route path="/ma/:id" element={<ManagerApproval />} />
					<Route
						exact
						path="/"
						element={<HomePage status="all" />}
					/>{" "}
				</Routes>{" "}
			</div>
		)
	}
	const SideNavbar = () => {
		// const history = useHistory();
		const [activeHref, setActiveHref] = useState("#/")
		return (
			<SideNavigation
				activeHref={activeHref}
				header={{ text: "CCS Central", href: "/" }}
				items={[
					{
						type: "section",
						text: "Resources",
						items: [
							{
								type: "link",
								text: "User Guide",
								href: "/userguide",
							},
							{
								type: "link",
								text: "About Us",
								href: "/aboutus",
							},
							{
								type: "link",
								text: "SOP",
								href: "https://w.amazon.com/bin/view/ASCS/CSP/CCS/SOPs/",
								external: true,
							},
							// here external true shows the link is external link
						],
					},
					{
						type: "section",
						text: "Configurations",
						items: [
							{
								type: "link",
								text: "Data Augmenter Setup Requests",
								href: "/dasr",
							},
							{
								type: "link",
								text: "OLS Configuration",
								href: "/ols",
							},
							{
								type: "link",
								text: "Merchant/Marketplace/Vendor Creation",
								href: "/mmv",
							},
							{
								type: "link",
								text: "Brand Code Update Request",
								href: "/bc",
							},
							{
								type: "link",
								text: "Misc Metadata Requests",
								href: "/mmr",
							},
							{
								type: "link",
								text: "AVS Configuration",
								href: "/avs",
							},
							{
								type: "link",
								text: "IMS Client Token and Throttle Configuration Requests",
								href: "/imsclient",
							},
							{
								type: "link",
								text: "Variation Dimension Sorting",
								href: "/vds",
							},
							{
								type: "link",
								text: "ORCS Configuration Changes",
								href: "/orcs",
							},
						],
					},
				]}
				onFollow={event => {
					if (!event.detail.external) {
						// event.preventDefault();
						setActiveHref(event.detail.href)
						//history.push(event.detail.href);
					}
				}}
			/>
		)
	}
	const Navbar = () => {
		return (
			<div id="TopNavigation">
				<TopNavigation
					identity={{
						href: "/",
						title: "CCS Central",
						logo: {
							src: amazonLogo,
							alt: "Service",
						},
					}}
					utilities={[
						{
							type: "button",
							text: schduleImg(),
							href: "https://oncall.corp.amazon.com/#/view/catalog-configuration-support/schedule",
							external: true,
						},
						{
							type: "button",
							text: SessionData.getUser(),
							href:
								"https://phonetool.amazon.com/users/" +
								cookies["username"],
							iconUrl:
								"https://internal-cdn.amazon.com/badgephotos.amazon.com/?uid=" +
								cookies["username"],
							external: true,
						},
					]}
					i18nStrings={{
						searchIconAriaLabel: "Search",
						searchDismissIconAriaLabel: "Close search",
						overflowMenuTriggerText: "More",
						overflowMenuTitleText: "All",
						overflowMenuBackIconAriaLabel: "Back",
						overflowMenuDismissIconAriaLabel: "Close menu",
					}}
				/>{" "}
			</div>
		)
	}
	console.log("Hello")
	setTimeout(() => {
		console.log("World!")
	}, 10000)
	console.log("Goodbye!")
	return (
		<>
			<Router>
				{/* {" "}
				{SessionData.getMarketPlace().map((key, val) => {
					console.log(key, val, SessionData.getMarketPlace())
					return (
						<div>
							<strong> {key}: </strong> <p> {val} </p>{" "}
						</div>
					)
				})}{" "} */}
				{Navbar()}{" "}
				<AppLayout
					headerSelector={"#TopNavigation"}
					content={Content()}
					navigation={SideNavbar()}
					tools={AboutUs()}
				/>
			</Router>
		</>
	)
}
