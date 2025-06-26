import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Fragment, useState } from "react";
import { toast } from "react-toastify";
import Emphasis from "../mdx/Emphasis";
import { H2 } from "../mdx/Heading";
import Strong from "../mdx/Strong";

export function SubmitErrorDialog(props: { isOpen: boolean; onClose: () => void; codes: Record<string, string> }) {
  const [submissionType, setSubmissionType] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const labelClass = "block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200";
  const inputClass =
    '"block w-full rounded-md bg-gray-100 dark:bg-table-row-background-secondary-dark border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-white"';

  return (
    <Transition appear show={props.isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={props.onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-md bg-white dark:bg-background-dark py-3 pb-6 px-5 text-left align-middle shadow-xl transition-all">
                <DialogTitle as={H2} useAnchor={false} useCopy={false}>
                  Submit an Error
                </DialogTitle>
                <p className="text-text-light/80 dark:text-text-dark/80 -mt-3 ">
                  Thanks for your contribution! Please fill out the form below to add your error code.
                </p>
                <p className="text-text-light/80 dark:text-text-dark/80 mt-2 mb-5">
                  <Emphasis>Note:</Emphasis> Please ensure that your client/API locale is set to{" "}
                  <Strong>English (US)</Strong>.
                </p>
                <form
                  className="flex flex-col gap-4"
                  onSubmit={(e) => {
                    e.preventDefault();

                    setIsSubmitting(true);
                    // PUT to /api/codes
                    fetch("/api/codes", {
                      method: "PUT",
                      body: new FormData(e.currentTarget),
                    }).then((res) => {
                      if (res.ok) {
                        setIsSubmitting(false);
                        setError("");
                        props.onClose();
                        toast.success("Your error code has been submitted. Thank you!");
                      } else {
                        res.text().then((text) => {
                          setIsSubmitting(false);
                          setError(text);
                        });
                      }
                    });
                  }}
                >
                  <div>
                    <label htmlFor="code" className={labelClass}>
                      Error Code{" "}
                      {errorCode && (
                        <span className="text-sm opacity-60">
                          {props.codes[errorCode] && `— ${props.codes[errorCode]}`}
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      autoComplete="off"
                      id="code"
                      name="code"
                      value={errorCode}
                      onChange={(e) => setErrorCode(e.target.value)}
                      required
                      className={inputClass}
                      list="error-codes-list"
                    />
                    <datalist id="error-codes-list">
                      {Object.keys(props.codes).map((code) => (
                        <option key={code} value={code}>
                          {props.codes[code]}
                        </option>
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label htmlFor="submissionType" className={labelClass}>
                      Submission Type
                    </label>
                    <select
                      id="submission_type"
                      name="submission_type"
                      value={submissionType}
                      onChange={(e) => setSubmissionType(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Choose an option</option>
                      {errorCode in props.codes && (
                        <>
                          <option value="update">Update Error Message</option>
                          <option value="delete">Remove Error Code</option>
                        </>
                      )}
                      {errorCode && !(errorCode in props.codes) && <option value="new">New Error Code</option>}
                    </select>
                  </div>

                  {["update", "new"].includes(submissionType) && (
                    <div>
                      <label htmlFor="message" className={labelClass}>
                        {submissionType === "update" && "New"} Error Message
                      </label>
                      <input
                        type="text"
                        autoComplete="off"
                        id="message"
                        name="message"
                        required
                        defaultValue={props.codes[errorCode] || ""}
                        className={inputClass}
                      />
                    </div>
                  )}

                  {submissionType && (
                    <div>
                      <label htmlFor="change_description" className={labelClass}>
                        Reason for Change
                      </label>
                      <p className="text-sm text-text-light/70 dark:text-text-dark/80 mb-3">
                        {submissionType === "update"
                          ? "Explain why this error code is being updated, including endpoints or features if applicable."
                          : submissionType === "new"
                            ? "Describe where this error code is used, e.g. the endpoint you encountered it at or the feature in the Discord app you were using."
                            : submissionType === "delete"
                              ? "Explain why this error code is being removed."
                              : ""}{" "}
                        You can include a way for us to contact you directly, such as a Discord ID, if you want.
                      </p>

                      <textarea
                        id="change_description"
                        name="change_description"
                        required
                        className={inputClass}
                        autoComplete="off"
                        rows={3}
                      />
                    </div>
                  )}

                  <div className="w-full flex flex-col gap-2">
                    <button
                      className="inline-flex justify-center items-center gap-2 rounded-md px-4 md:px-5 py-2 md:py-2.5 text-lg/80 md:text-md/80 text-center bg-brand-blurple font-semibold text-white focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white hover:bg-brand-blurple/90 data-open:bg-gray-700 disabled:opacity-50"
                      type="submit"
                      aria-label="Finish your submission"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Finishing..." : "Finish"}
                    </button>
                    <p className="text-center text-red-500 dark:text-red-400">{error}</p>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
