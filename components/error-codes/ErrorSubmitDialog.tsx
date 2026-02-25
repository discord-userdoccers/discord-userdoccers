import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Fragment, useMemo, useState } from "react";
import { toast } from "react-toastify";
import classNames from "../../lib/classnames";
import { ErrorGroup } from "./ErrorCodesEmbed";
import Styles from "../../stylesheets/modules/Errors.module.css";
import { H2 } from "../mdx/Heading";
import Strong from "../mdx/Strong";

function getErrorGroup(code: string, groups: ErrorGroup[]): ErrorGroup | undefined {
  const groupIndex = parseInt(code.slice(0, -4), 10);

  return groups.find((group) => group.index === groupIndex);
}

export function SubmitErrorDialog(props: { isOpen: boolean; onClose: () => void; codes: ErrorGroup[] }) {
  const [errorCode, setErrorCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const codesFlat = useMemo(
    () => (props.codes ? Object.fromEntries(props.codes.flatMap((x) => Object.entries(x.codes))) : {}),
    [props.codes],
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const selectedGroup = useMemo(() => getErrorGroup(errorCode, props.codes), [errorCode]);
  return (
    <Transition appear unmount show={props.isOpen} as={Fragment}>
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
              <DialogPanel className={Styles.dialogPanel}>
                <DialogTitle as={H2} useAnchor={false} useCopy={false}>
                  Submit an Error
                </DialogTitle>
                <p className={classNames(Styles.dialogText, "-mt-3")}>
                  Thanks for your contribution! Fill out the form below to add your error code.
                </p>
                <p className={classNames(Styles.dialogText, "mb-5 mt-2")}>
                  Please ensure that your client or API locale is set to <Strong>English (US)</Strong> before
                  submitting.
                </p>
                <form
                  className="flex flex-col gap-4"
                  onSubmit={(e) => {
                    e.preventDefault();

                    setIsSubmitting(true);
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
                    <label htmlFor="code" className={Styles.dialogLabel}>
                      Error Code{" "}
                      {errorCode && (
                        <span className="text-sm opacity-60">{selectedGroup && `— ${selectedGroup.name}`}</span>
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
                      className={Styles.dialogInput}
                      list="error-codes-list"
                    />
                  </div>

                  <div className="hidden" aria-hidden hidden>
                    <label htmlFor="submissionType" className={Styles.dialogLabel}>
                      Submission Type
                    </label>
                    <input
                      type="text"
                      id="submission_type"
                      name="submission_type"
                      value={errorCode in codesFlat ? "update" : "new"}
                      className={Styles.dialogInput}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className={Styles.dialogLabel}>
                      {errorCode in codesFlat && "Updated"} Error Message
                    </label>
                    <input
                      type="text"
                      autoComplete="off"
                      id="message"
                      name="message"
                      required
                      defaultValue={codesFlat[errorCode] || ""}
                      className={Styles.dialogInput}
                    />
                  </div>

                  <div>
                    <label htmlFor="change_description" className={Styles.dialogLabel}>
                      Reason for Change
                    </label>
                    <p className={classNames(Styles.dialogText, "mb-3 text-sm")}>
                      {errorCode in codesFlat
                        ? "Explain why this error code is being updated"
                        : "Describe where this error code is used"}
                      , including screenshots or API requests if applicable. You may include a way for us to contact you
                      directly, such as a Discord ID.
                    </p>

                    <textarea
                      id="change_description"
                      name="change_description"
                      required
                      className={Styles.dialogInput}
                      autoComplete="off"
                      rows={3}
                    />
                  </div>

                  <div className="flex w-full flex-col gap-2">
                    <button
                      className="text-lg/80 md:text-md/80 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-open:bg-gray-700 inline-flex items-center justify-center gap-2 rounded-md bg-brand-blurple px-4 py-2 text-center text-white hover:bg-brand-blurple/90 disabled:opacity-50 md:px-5 md:py-2.5"
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
