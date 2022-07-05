import React from "react";
import { GradingJobProps } from "../reducers/grading-job-reducer";
import GradingJobTableItem from "./grading-job-table-item";

const GradingJobTable = ({
  grading_job_queue,
}: {
  grading_job_queue: GradingJobProps[];
}) => {
  return (
    <table className="table table-hover table-striped text-center">
      <thead>
        <tr>
          <th scope="col">User/Team ID</th>
          <th scope="col">Submission</th>
          <th scope="col">Wait Time</th>
          <th scope="col">Release Time</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {grading_job_queue && grading_job_queue.length > 0 ? (
          grading_job_queue.map((grading_job, index) => {
            return (
              <GradingJobTableItem
                sub_id={grading_job.submission_id}
                user_id={grading_job.user_id ? grading_job.user_id : undefined}
                team_id={grading_job.team_id ? grading_job.team_id : undefined}
                created_at={grading_job.created_at}
                release_time={grading_job.priority}
                position={index + 1}
                total={grading_job_queue.length}
              />
            );
          })
        ) : (
          <h3>There are no jobs in the queue</h3>
        )}
      </tbody>
    </table>
  );
};
export default GradingJobTable;
