import React from "react"
import ActualTable from "./tabel"
import footer from "./footer"
import { useParams } from "react-router-dom"
import SessionData from "./SessionData"

export default function HomePage() {
	let { status } = useParams()

	// if (!status) status = "all"
	if (SessionData.getLevel() === 0) {
		return (
			<div className="m-4 text-danger">
				<p>
					You are <strong> not allowed </strong> access this.{" "}
				</p>{" "}
			</div>
		)
	}

	return (
		<div className="m-3 bg bg-light">
			<h1 className="m-3"> Dashboard </h1>{" "}
			{ActualTable(!status ? "all" : status)} <br />
			<br /> {footer()}{" "}
		</div>
	)
}
