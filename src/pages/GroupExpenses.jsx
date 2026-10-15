import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";

import { serverEndpoint } from "../config/appConfig";

function GroupExpenses() {

    // Get group ID from URL
    const { groupId } = useParams();

    // Currently logged-in user (needed to restrict Pay button to the right person)
    const user = useSelector((state) => state.userDetails);

    // ------------------------------------------------
    // State
    // ------------------------------------------------

    const [group, setGroup] = useState(null);
    const [expenses, setExpenses] = useState([]);

    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [paidBy, setPaidBy] = useState("");

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // Settlement states (this was missing — caused the ReferenceErrors)
    const [settlementData, setSettlementData] = useState(null);
    const [settlementLoading, setSettlementLoading] = useState(true);

    // Settlement payment states
    const [paymentLoading, setPaymentLoading] = useState(null);
    const [paymentMessage, setPaymentMessage] = useState("");
    const [paymentError, setPaymentError] = useState("");


    // ------------------------------------------------
    // Fetch group + expense history
    // ------------------------------------------------

    const fetchGroupExpenses = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await axios.get(
                `${serverEndpoint}/expenses/group/${groupId}`,
                {
                    withCredentials: true
                }
            );

            setGroup(response.data.group);

            setExpenses(
                response.data.expenses || []
            );


            // Select first member by default
            if (
                response.data.group?.membersEmail?.length > 0
            ) {

                setPaidBy((currentPaidBy) => {

                    if (currentPaidBy) {
                        return currentPaidBy;
                    }

                    return response.data.group.membersEmail[0];
                });
            }


        } catch (error) {

            console.error(
                "Unable to fetch group expenses:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to fetch group details"
            );

        } finally {

            setLoading(false);
        }
    };


    const fetchSettlements = async () => {
        try {
            setSettlementLoading(true);

            const response = await axios.get(
                `${serverEndpoint}/settlements/group/${groupId}`,
                {
                    withCredentials: true,
                }
            );

            console.log("Settlement response:", response.data);

            setSettlementData(response.data);

        } catch (error) {
            console.error(
                "Unable to fetch settlements:",
                error
            );
        } finally {
            setSettlementLoading(false);
        }
    };


    // ------------------------------------------------
    // Pay a settlement suggestion via Razorpay
    // ------------------------------------------------

    const handleSettlementPayment = async (payment) => {

        const paymentKey = `${payment.from}-${payment.to}`;

        setPaymentMessage("");
        setPaymentError("");

        try {

            setPaymentLoading(paymentKey);

            const orderResponse = await axios.post(
                `${serverEndpoint}/settlements/create-order`,
                {
                    groupId: groupId,
                    from: payment.from,
                    to: payment.to,
                    amount: payment.amount
                },
                {
                    withCredentials: true
                }
            );

            const order = orderResponse.data.order;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "MergeMoney",
                description: `Settlement: ${payment.from} → ${payment.to}`,
                order_id: order.id,
                theme: {
                    color: "#3399cc"
                },
                handler: async (response) => {

                    try {

                        const verifyResponse = await axios.post(
                            `${serverEndpoint}/settlements/verify-payment`,
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                groupId: groupId,
                                from: payment.from,
                                to: payment.to,
                                amount: payment.amount
                            },
                            {
                                withCredentials: true
                            }
                        );

                        setPaymentMessage(
                            verifyResponse.data.message ||
                            `Payment of ₹${Number(payment.amount).toFixed(2)} completed successfully.`
                        );

                        // Refresh settlement summary to reflect the new balances
                        await fetchSettlements();

                    } catch (error) {

                        console.error(
                            "Unable to verify settlement payment:",
                            error
                        );

                        setPaymentError(
                            error.response?.data?.message ||
                            "Payment succeeded but verification failed. Please contact support."
                        );

                    } finally {

                        setPaymentLoading(null);
                    }
                },

                modal: {
                    ondismiss: () => {
                        setPaymentLoading(null);
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();

        } catch (error) {

            console.error(
                "Unable to create settlement order:",
                error
            );

            setPaymentError(
                error.response?.data?.message ||
                "Unable to initiate payment. Please try again."
            );

            setPaymentLoading(null);
        }
    };


    // ------------------------------------------------
    // Run when page opens
    // ------------------------------------------------

    useEffect(() => {
        fetchGroupExpenses();
        fetchSettlements();
    }, [groupId]);


    // ------------------------------------------------
    // Add new expense
    // ------------------------------------------------

    const handleAddExpense = async (event) => {

        event.preventDefault();

        setError("");
        setMessage("");


        // Basic frontend validation

        if (!title.trim()) {

            setError(
                "Please enter an expense title"
            );

            return;
        }


        if (
            !amount ||
            Number(amount) <= 0
        ) {

            setError(
                "Please enter a valid amount"
            );

            return;
        }


        if (!paidBy) {

            setError(
                "Please select who paid"
            );

            return;
        }


        try {

            setSubmitting(true);


            const response = await axios.post(

                `${serverEndpoint}/expenses/create`,

                {
                    groupId: groupId,
                    title: title.trim(),
                    amount: Number(amount),
                    paidBy: paidBy
                },

                {
                    withCredentials: true
                }
            );


            setMessage(
                response.data.message ||
                "Expense added successfully"
            );


            // Clear form

            setTitle("");
            setAmount("");


            // Refresh group + expenses

            await fetchGroupExpenses();

            // Refresh settlements too, since a new expense changes balances
            await fetchSettlements();


        } catch (error) {

            console.error(
                "Unable to create expense:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to add expense"
            );

        } finally {

            setSubmitting(false);
        }
    };


    // ------------------------------------------------
    // Loading
    // ------------------------------------------------

    if (loading && !group) {

        return (

            <div className="container py-5 text-center">

                <div
                    className="spinner-border text-primary"
                    role="status"
                >
                    <span className="visually-hidden">
                        Loading...
                    </span>
                </div>

                <p className="text-muted mt-3">
                    Loading group expenses...
                </p>

            </div>
        );
    }


    // ------------------------------------------------
    // UI
    // ------------------------------------------------

    return (

        <div className="container py-5">


            {/* Breadcrumb */}

            <nav aria-label="breadcrumb">

                <ol className="breadcrumb">

                    <li className="breadcrumb-item">

                        <Link to="/dashboard">
                            Groups
                        </Link>

                    </li>

                    <li className="breadcrumb-item active">
                        Expense Details
                    </li>

                </ol>

            </nav>


            {/* Error */}

            {error && (

                <div className="alert alert-danger">
                    {error}
                </div>

            )}


            {/* Success */}

            {message && (

                <div className="alert alert-success">
                    {message}
                </div>

            )}


            {group && (

                <>

                    {/* =====================================
                        GROUP INFORMATION
                    ====================================== */}

                    <div className="card border-0 shadow-sm mb-4">

                        <div className="card-body p-4">

                            <h2 className="fw-bold mb-2">

                                <i className="bi bi-people me-2"></i>

                                {group.name}

                            </h2>


                            {group.description && (

                                <p className="text-muted">

                                    {group.description}

                                </p>

                            )}


                            <p className="mb-2">

                                <strong>Admin: </strong>

                                {group.adminEmail}

                            </p>


                            <p className="mb-2">

                                <strong>Total Members: </strong>

                                {group.membersEmail?.length || 0}

                            </p>


                            <div className="mt-3">

                                <strong>Members:</strong>

                                <div className="mt-2">

                                    {group.membersEmail?.map(
                                        (email) => (

                                            <span
                                                key={email}
                                                className="badge bg-light text-dark border me-2 mb-2"
                                            >
                                                {email}
                                            </span>

                                        )
                                    )}

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* =====================================
                        ADD EXPENSE
                    ====================================== */}

                    <div className="card border-0 shadow-sm mb-4">

                        <div className="card-body p-4">

                            <h4 className="fw-bold mb-4">

                                <i className="bi bi-plus-circle me-2"></i>

                                Add New Expense

                            </h4>


                            <form onSubmit={handleAddExpense}>


                                <div className="row g-3">


                                    {/* Title */}

                                    <div className="col-md-4">

                                        <label className="form-label fw-semibold">
                                            Expense Title
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Example: Dinner"
                                            value={title}
                                            onChange={(event) =>
                                                setTitle(event.target.value)
                                            }
                                        />

                                    </div>


                                    {/* Amount */}

                                    <div className="col-md-4">

                                        <label className="form-label fw-semibold">
                                            Amount (₹)
                                        </label>

                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Example: 1200"
                                            min="1"
                                            step="0.01"
                                            value={amount}
                                            onChange={(event) =>
                                                setAmount(event.target.value)
                                            }
                                        />

                                    </div>


                                    {/* Paid By */}

                                    <div className="col-md-4">

                                        <label className="form-label fw-semibold">
                                            Paid By
                                        </label>

                                        <select
                                            className="form-select"
                                            value={paidBy}
                                            onChange={(event) =>
                                                setPaidBy(event.target.value)
                                            }
                                        >

                                            {group.membersEmail?.map(
                                                (email) => (

                                                    <option
                                                        key={email}
                                                        value={email}
                                                    >
                                                        {email}
                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </div>


                                </div>


                                {/* Split information */}

                                <div className="alert alert-light border mt-4 mb-3">

                                    <strong>Split Type:</strong>{" "}

                                    Equal Split

                                    {amount &&
                                        group.membersEmail?.length > 0 &&
                                        Number(amount) > 0 && (

                                            <span className="ms-2">

                                                — ₹
                                                {(
                                                    Number(amount) /
                                                    group.membersEmail.length
                                                ).toFixed(2)}

                                                {" "}per person

                                            </span>

                                        )}

                                </div>


                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={submitting}
                                >

                                    {submitting
                                        ? "Adding Expense..."
                                        : "Add Expense"
                                    }

                                </button>


                            </form>

                        </div>

                    </div>


                    {/* =====================================
                        EXPENSE HISTORY
                    ====================================== */}

                    <div className="card border-0 shadow-sm">

                        <div className="card-body p-4">

                            <h4 className="fw-bold mb-4">

                                <i className="bi bi-clock-history me-2"></i>

                                Expense History

                            </h4>


                            {expenses.length === 0 ? (

                                <div className="text-center py-4">

                                    <p className="text-muted mb-0">

                                        No expenses added yet.

                                    </p>

                                    <small className="text-muted">

                                        Add your first group expense above.

                                    </small>

                                </div>

                            ) : (

                                <div className="table-responsive">

                                    <table className="table align-middle">

                                        <thead>

                                            <tr>

                                                <th>
                                                    Title
                                                </th>

                                                <th>
                                                    Amount
                                                </th>

                                                <th>
                                                    Paid By
                                                </th>

                                                <th>
                                                    Split
                                                </th>

                                                <th>
                                                    Date
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {expenses.map(
                                                (expense) => (

                                                    <tr key={expense._id}>

                                                        <td className="fw-semibold">

                                                            {expense.title}

                                                        </td>


                                                        <td>

                                                            ₹
                                                            {Number(
                                                                expense.amount
                                                            ).toFixed(2)}

                                                        </td>


                                                        <td>

                                                            {expense.paidBy}

                                                        </td>


                                                        <td>

                                                            ₹
                                                            {Number(
                                                                expense.splitAmount
                                                            ).toFixed(2)}

                                                            /person

                                                        </td>


                                                        <td>

                                                            {expense.createdAt
                                                                ? new Date(
                                                                    expense.createdAt
                                                                ).toLocaleString()
                                                                : "-"
                                                            }

                                                        </td>

                                                    </tr>

                                                )
                                            )}

                                        </tbody>

                                    </table>

                                </div>

                            )}

                        </div>

                    </div>
                    {/* ==========================================
    SETTLEMENT SUMMARY
========================================== */}

<div className="card border-0 shadow-sm mt-4">
    <div className="card-body p-4">

        <h4 className="fw-bold mb-4">
            Settlement Summary
        </h4>

        {settlementLoading ? (

            <div className="text-center py-4">

                <div
                    className="spinner-border text-primary"
                    role="status"
                >
                    <span className="visually-hidden">
                        Loading...
                    </span>
                </div>

            </div>

        ) : (

            <>
                {/* MEMBER BALANCES */}

                <h6 className="fw-bold mb-3">
                    Member Balances
                </h6>

                {settlementData?.balances?.length > 0 ? (

                    <div className="table-responsive mb-5">

                        <table className="table align-middle">

                            <thead>
                                <tr>
                                    <th>Member</th>
                                    <th>Status</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>

                            <tbody>

                                {settlementData.balances.map(
                                    (balance) => (

                                        <tr key={balance.email}>

                                            <td>
                                                {balance.email}
                                            </td>

                                            <td>

                                                {balance.balance > 0 && (
                                                    <span className="badge bg-success">
                                                        Gets
                                                    </span>
                                                )}

                                                {balance.balance < 0 && (
                                                    <span className="badge bg-danger">
                                                        Owes
                                                    </span>
                                                )}

                                                {balance.balance === 0 && (
                                                    <span className="badge bg-secondary">
                                                        Settled
                                                    </span>
                                                )}

                                            </td>

                                            <td className="fw-bold">

                                                {balance.balance > 0 &&
                                                    `₹${balance.balance.toFixed(2)}`
                                                }

                                                {balance.balance < 0 &&
                                                    `₹${Math.abs(
                                                        balance.balance
                                                    ).toFixed(2)}`
                                                }

                                                {balance.balance === 0 &&
                                                    "₹0.00"
                                                }

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                ) : (

                    <p className="text-muted">
                        No balance information available.
                    </p>

                )}


                {/* ==================================
                    PAYMENTS REQUIRED
                =================================== */}

                <h5 className="fw-bold mb-3">
                    Payments Required
                </h5>

                {paymentMessage && (
                    <div className="alert alert-success">
                        {paymentMessage}
                    </div>
                )}

                {paymentError && (
                    <div className="alert alert-danger">
                        {paymentError}
                    </div>
                )}


                {settlementData?.suggestions?.length > 0 ? (

                    <div className="row g-3">

                        {settlementData.suggestions.map(
                            (payment, index) => (

                                <div
                                    className="col-md-6"
                                    key={index}
                                >

                                    <div className="border rounded-4 p-4 h-100">

                                        <div className="d-flex justify-content-between align-items-center">

                                            <div>

                                                <div className="small text-muted">
                                                    From
                                                </div>

                                                <div className="fw-bold">
                                                    {payment.from}
                                                </div>

                                            </div>


                                            <div className="text-primary fs-4 px-3">
                                                →
                                            </div>


                                            <div className="text-end">

                                                <div className="small text-muted">
                                                    To
                                                </div>

                                                <div className="fw-bold">
                                                    {payment.to}
                                                </div>

                                            </div>

                                        </div>


                                        <hr />


                                        <div className="d-flex justify-content-between align-items-center mb-3">

                                            <span className="text-muted">
                                                Amount to pay
                                            </span>

                                            <span className="fs-4 fw-bold text-danger">
                                                ₹{Number(
                                                    payment.amount
                                                ).toFixed(2)}
                                            </span>

                                        </div>

                                        {/* Only the member who actually owes this
                                            amount gets a usable Pay button. Everyone
                                            else just sees the info above. */}

                                        {user?.email === payment.from ? (

                                            <button
                                                className="btn btn-primary w-100 rounded-pill fw-bold"
                                                onClick={() => handleSettlementPayment(payment)}
                                                disabled={
                                                    paymentLoading === `${payment.from}-${payment.to}`
                                                }
                                            >
                                                {paymentLoading === `${payment.from}-${payment.to}`
                                                    ? "Processing..."
                                                    : `Pay ₹${Number(payment.amount).toFixed(2)}`
                                                }
                                            </button>

                                        ) : (

                                            <div className="text-center small text-muted">
                                                Waiting for {payment.from} to pay
                                            </div>

                                        )}

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                ) : (

                    <div className="alert alert-success mb-0">

                        <strong>✓ Everyone is settled!</strong>

                        <div className="small mt-1">
                            There are currently no outstanding payments.
                        </div>

                    </div>

                )}

            </>

        )}

    </div>
</div>

                </>

            )}

        </div>
    );
}

export default GroupExpenses;
