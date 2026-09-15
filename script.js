/* =====================================
   EXPENSE & BUDGET VISUALIZER
   VANILLA JAVASCRIPT
===================================== */


/* =====================================
   GET HTML ELEMENTS
===================================== */

const form =
    document.getElementById("transactionForm");

const itemNameInput =
    document.getElementById("itemName");

const amountInput =
    document.getElementById("amount");

const categoryInput =
    document.getElementById("category");

const totalBalance =
    document.getElementById("totalBalance");

const transactionList =
    document.getElementById("transactionList");

const transactionCount =
    document.getElementById("transactionCount");

const emptyState =
    document.getElementById("emptyState");

const sortBtn =
    document.getElementById("sortBtn");

const themeBtn =
    document.getElementById("themeBtn");


/* =====================================
   LOCAL STORAGE KEY
===================================== */

const TRANSACTION_KEY =
    "expenseVisualizerTransactions";

const THEME_KEY =
    "expenseVisualizerTheme";


/* =====================================
   DATA
===================================== */

let transactions = [];

let chart = null;

let descending = true;


/* =====================================
   LOAD TRANSACTIONS
===================================== */

function loadTransactions() {

    const saved =
        localStorage.getItem(
            TRANSACTION_KEY
        );


    if (saved) {

        try {

            transactions =
                JSON.parse(saved);

        } catch (error) {

            transactions = [];

        }

    }

}


/* =====================================
   SAVE TRANSACTIONS
===================================== */

function saveTransactions() {

    localStorage.setItem(
        TRANSACTION_KEY,
        JSON.stringify(transactions)
    );

}


/* =====================================
   FORMAT RUPIAH
===================================== */

function rupiah(number) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }
    ).format(number);

}


/* =====================================
   UPDATE TOTAL
===================================== */

function updateTotal() {

    const total =
        transactions.reduce(
            (sum, transaction) => {

                return sum +
                    Number(transaction.amount);

            },
            0
        );


    totalBalance.textContent =
        rupiah(total);


    /*
       Highlight merah apabila
       total pengeluaran > Rp1.000.000
    */

    if (total > 1000000) {

        totalBalance.classList.add(
            "warning"
        );

    } else {

        totalBalance.classList.remove(
            "warning"
        );

    }

}


/* =====================================
   UPDATE COUNT
===================================== */

function updateCount() {

    const count =
        transactions.length;


    transactionCount.textContent =
        count === 1
            ? "1 transaction"
            : `${count} transactions`;

}


/* =====================================
   RENDER TRANSACTIONS
===================================== */

function renderTransactions() {

    transactionList.innerHTML = "";


    // Jika belum ada transaksi
    if (transactions.length === 0) {

        emptyState.style.display = "flex";

        return;

    }


    emptyState.style.display = "none";


    transactions.forEach(function(transaction) {

        /* ==============================
           TRANSACTION ITEM
        ============================== */

        const item =
            document.createElement("div");

        item.className =
            "transaction-item";


        /* ==============================
           LEFT SIDE
        ============================== */

        const info =
            document.createElement("div");


        const name =
            document.createElement("div");

        name.className =
            "transaction-name";

        name.textContent =
            transaction.name;


        const badge =
            document.createElement("span");

        badge.className =
            "transaction-category";

        badge.textContent =
            transaction.category;


        info.appendChild(name);

        info.appendChild(badge);


        /* ==============================
           RIGHT SIDE
        ============================== */

        const right =
            document.createElement("div");

        right.className =
            "transaction-right";


        /* AMOUNT */

        const price =
            document.createElement("span");

        price.className =
            "transaction-amount";

        price.textContent =
            rupiah(transaction.amount);


        /* ==============================
           DELETE BUTTON
        ============================== */

        const deleteBtn =
            document.createElement("button");

        deleteBtn.className =
            "delete-btn";

        deleteBtn.type =
            "button";

        deleteBtn.textContent =
            "Delete";


        /*
           Ketika tombol Delete diklik,
           transaksi akan dihapus berdasarkan ID.
        */

        deleteBtn.addEventListener(
            "click",
            function() {

                deleteTransaction(
                    transaction.id
                );

            }
        );


        /* ==============================
           APPEND
        ============================== */

        right.appendChild(price);

        right.appendChild(deleteBtn);


        item.appendChild(info);

        item.appendChild(right);


        transactionList.appendChild(item);

    });

}

/* =====================================
   DELETE TRANSACTION
===================================== */

function deleteTransaction(id) {

    transactions =
        transactions.filter(
            transaction =>
                transaction.id !== id
        );


    saveTransactions();

    renderApp();

}


/* =====================================
   SORT BY AMOUNT
===================================== */

sortBtn.addEventListener(
    "click",
    function () {

        transactions.sort(
            function (a, b) {

                if (descending) {

                    return (
                        Number(b.amount) -
                        Number(a.amount)
                    );

                }

                return (
                    Number(a.amount) -
                    Number(b.amount)
                );

            }
        );


        descending =
            !descending;


        sortBtn.textContent =
            descending
                ? "↕ Sort Amount"
                : "↕ Amount: Low → High";


        renderTransactions();

    }
);


/* =====================================
   CATEGORY TOTAL
===================================== */

function getCategoryTotals() {

    const totals = {

        Food: 0,

        Transport: 0,

        Fun: 0

    };


    transactions.forEach(
        transaction => {

            if (
                totals[
                    transaction.category
                ] !== undefined
            ) {

                totals[
                    transaction.category
                ] += Number(
                    transaction.amount
                );

            }

        }
    );


    return totals;

}


/* =====================================
   UPDATE PIE CHART
===================================== */

function updateChart() {

    const canvas =
        document.getElementById(
            "categoryChart"
        );


    if (!canvas) return;


    const ctx =
        canvas.getContext("2d");


    const totals =
        getCategoryTotals();


    /* Destroy chart lama */

    if (chart) {

        chart.destroy();

    }


    /* Buat chart baru */

    chart = new Chart(
        ctx,
        {

            type: "pie",

            data: {

                labels: [
                    "Food",
                    "Transport",
                    "Fun"
                ],

                datasets: [

                    {

                        data: [

                            totals.Food,

                            totals.Transport,

                            totals.Fun

                        ],

                        backgroundColor: [

                            "#3b82f6",

                            "#f59e0b",

                            "#8b5cf6"

                        ],

                        borderWidth: 3,

                        borderColor:
                            getComputedStyle(
                                document.body
                            )
                            .getPropertyValue(
                                "--card"
                            )

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        display: false

                    },

                    tooltip: {

                        callbacks: {

                            label:
                                function (
                                    context
                                ) {

                                    return (
                                        " " +
                                        rupiah(
                                            context.raw
                                        )
                                    );

                                }

                        }

                    }

                }

            }

        }
    );

}


/* =====================================
   DARK / LIGHT MODE
===================================== */

function applyTheme(theme) {

    if (theme === "dark") {

        document.body.classList.add(
            "dark"
        );

        themeBtn.textContent =
            "☀️";

    } else {

        document.body.classList.remove(
            "dark"
        );

        themeBtn.textContent =
            "🌙";

    }

}


/* =====================================
   THEME BUTTON
===================================== */

themeBtn.addEventListener(
    "click",
    function () {

        const dark =
            document.body.classList.contains(
                "dark"
            );


        const newTheme =
            dark
                ? "light"
                : "dark";


        applyTheme(newTheme);


        localStorage.setItem(
            THEME_KEY,
            newTheme
        );


        updateChart();

    }
);


/* =====================================
   RENDER EVERYTHING
===================================== */

function renderApp() {

    updateTotal();

    updateCount();

    renderTransactions();

    updateChart();

}


/* =====================================
   START
===================================== */

function init() {

    /* Load transactions */

    loadTransactions();


    /* Load theme */

    const savedTheme =
        localStorage.getItem(
            THEME_KEY
        ) || "light";


    applyTheme(savedTheme);


    /* Render */

    renderApp();

}


/* RUN APP */

init();
