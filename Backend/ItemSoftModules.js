
const mysql = require("mysql2");                    // In order to interact with the mysql database.

//Create a connection between the backend server and the database:
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "FRACAS@22",
    database: "labbee"

    //host : "92.205.7.122",
    //user : "beaLab",
    //password : "FIycjLM5BTF;",
    //database : "i7627920_labbee"
});


// Function to handle the operations of the Item soft modules:

function itemSoftModulesAPIs(app) {

    // To add itemsoft modules to the table:
    app.post("/api/addItemsoftModules", (req, res) => {
        const { moduleName, moduleDescription } = req.body;

        // Perform a database query to store the data to the table:
        const sqlInsertModulesDetails = "INSERT INTO item_soft_modules (module_name, module_description) VALUES (?,?)";

        db.query(sqlInsertModulesDetails, [moduleName, moduleDescription], (error, result) => {
            if (error) {
                console.log(error)
                return res.status(500).json({ message: "Internal server error" });
            } else {
                res.status(200).json({ message: "Module added successfully" });
            }
        });

    })

    // To fetch the modules details in the modules page:
    app.get("/api/getItemsoftModules", (req, res) => {
        const itemsoftModulesList = "SELECT id, module_name, module_description FROM item_soft_modules";

        db.query(itemsoftModulesList, (error, result) => {
            if (error) {
                return res.status(500).json({ error: "An error occurred while fetching data" })
            }
            res.send(result);
        });
    });


    // To Edit the selected module
    app.post("/api/addItemsoftModules/:id", (req, res) => {
        const { moduleName, moduleDescription } = req.body;
        const id = req.params.id;
        // Perform a database query to store the data to the table:
        const sqlUpdateModulesDetails = `UPDATE item_soft_modules  SET module_name = '${moduleName}', module_description = '${moduleDescription}' WHERE id=${id}`;

        db.query(sqlUpdateModulesDetails, (error, result) => {
            if (error) {
                console.log(error)
                return res.status(500).json({ message: "Internal server error", result });
            } else {
                res.status(200).json({ message: "Module added successfully" });
            }
        });

    })


    // To fetch the modules details in the modules page:
    app.delete("/api/getItemsoftModules/:id", (req, res) => {
        const id = req.params.id;
        const deleteQuery = "DELETE FROM item_soft_modules WHERE id = ?";

        db.query(deleteQuery, [id], (error, result) => {
            if (error) {
                return res.status(500).json({ error: "An error occurred while deleting the module" });
            }
            res.status(200).json({ message: "Module deleted successfully" });
        });
    });

}


module.exports = { itemSoftModulesAPIs }

