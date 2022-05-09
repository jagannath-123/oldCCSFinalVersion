import React from "react"
import dashboard from "../static/dashboard.png"
import configurations from "../static/configurations.png"
import form from "../static/form.png"
import table from "../static/table.png"

export default function userGuide() {
	return (
		<div>
			<h1>User Guide</h1>
			<ol>
				<li>
					<h3>Stages Of Issue</h3>
					<p>
						The dashboard will be showing 4 options,
						<br /> 1) <strong>Total Configurations:</strong> This is
						will show the total count of configurations which you
						have raised till now by the user.
						<br /> 2) <strong>Pending Configurations:</strong> This
						will show the configurations raised by the user and
						which are under processing or still need to be resolved.
						<br /> 3) <strong>
							Completed Configurations:
						</strong>{" "}
						This will show the resolved configurations of the user,
						these configurations can also be used as reference for
						the future configurations.
						<br />
						4) <strong>My Approvals:</strong> This is for managers
						and CCS team which will show the configurations need to
						be solved by them.
					</p>
					<img src={dashboard} alt="dashboard" width="1000px" />
				</li>
				<li>
					<h3>Configurations View</h3>
					<p>
						This displays all the configurations raised by user. We
						have option to preview the request with out opening it.
						For bussieness users, update and delete options are
						provided, where as for CCS team approve and reject
						options are provided. Download option is also provide to
						get the reports in PDF and CSV formats.
					</p>
					<img src={table} alt="table" width="1000px" />
				</li>
				<li>
					<h3>Types of Configurations</h3>
					<p>
						There are total 9 types of configuration change
						requests, those options can be seen in side navigation.
					</p>
					<img
						src={configurations}
						alt="configurations"
						height="500px"
					/>
				</li>
				<li>
					<h3>Raising a Issue</h3>
					<p>
						For raising a configuration, user need to select the
						type of configuration according to the issue. Different
						configuration will have different type of inputs and
						different permissions, so user need to provide the
						required details and files. For some configurations
						there is also a need of managers approval, so first user
						need to get the manager approval by raising a manager
						approval configuration. This required detail about the
						issue, marketplace of the change and flies and screen
						shots if needed. Then after submitting them, manager
						will approve or reject with a remark, If there are any
						changes need to made, then it need to be updated and get
						the approval from the manger. Then user need to provide
						that link of manager approval in the configuration.
						After raising a configuration user can see the
						configuration in pending and total configurations.
					</p>
					<img src={form} alt="form" width="1000px" />
				</li>
				<li>
					<h3>Resolving a Configuration</h3>
					<p>
						This is done by the CCS team, the team will check the
						details provided by the requestor, if the details are
						wrong or not sufficient then resolver need to reject the
						request and give him the updates he need to make in
						remarks. For rejection remarks is must. If the
						configuration is approved then is will be adding the
						name of the approver who have approved or rejected the
						configuration. This will according to the person who
						will be handling the configurations at that time. After
						Approving, the user can see the configuration in
						completed configurations.
					</p>
				</li>
				<li>
					<h3>Types of Users</h3>
					<p>
						There are 3 types of users who will be a part of this
						CCS Central, those are; <br />
						1) CCS Team (Resolvers) <br />
						2) Business Team (Requestors, Approvers) <br />
						CCS team is the users who will be working with all the
						catalogue of amazon and supporting it. This team will
						resolve the issues raised and updated the changes to the
						production. They will be verifying and following the
						SOP’s to solve the issues. Business team is the team
						which will be raising the requests for changes in
						catalogues, there are different types of requests called
						as configurations. Each configuration have different use
						cases which will make changes in the catalogue. This
						Business team will be raising the issues by providing
						required information and files to approve and push to
						production. Manager team is the which will be approving
						the changes which are requested by the business team.
						This team will be checking the changes done after the
						production push is done.
					</p>
				</li>
			</ol>
		</div>
	)
}
