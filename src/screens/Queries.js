import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  CircularProgress,
  Paper,
  Pagination,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { apiEndpoints } from "../constants";
import { useUserContext } from "../App";

const Queries = () => {

  const { user } = useUserContext();
  
  const [queries, setQueries] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [newQuery, setNewQuery] = useState(""); // State for new query input
  const [answer, setAnswer] = useState(""); // State for answering queries

  const fetchQueries = async (isSearch = false) => {
    setLoading(true);
    try {
      const response = await fetch(apiEndpoints.getQueries, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isSearch ? { keyword: searchValue } : { keyword: "" }),
      });

      const data = await response.json();
      if (data.success) {
        setQueries(data.queries);
      } else {
        setQueries([]);
        alert(data.message || "No queries found.");
      }
    } catch (error) {
      console.error("Error fetching queries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchValue.trim()) return alert("Enter a keyword to search.");
    fetchQueries(true); // Trigger search queries
  };

  const handleCreateQuery = async () => {
    if (!newQuery.trim()) return alert("Enter a valid query.");
    setLoading(true);
    try {
      const response = await fetch(apiEndpoints.createQuery, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newQuery, customer_id: user.info.email }), // Replace with real customer_id
      });
      const data = await response.json();
      if (data.success) {
        alert("Query created successfully.");
        setNewQuery(""); // Clear the input field
        fetchQueries(); // Refresh the queries list
      } else {
        alert(data.message || "Failed to create query.");
      }
    } catch (error) {
      console.error("Error creating query:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerQuery = async (queryId) => {
    if (!answer.trim()) return alert("Enter a valid response.");
    setLoading(true);
    try {
      const response = await fetch(apiEndpoints.answerQuery, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query_id: queryId, answer }),
      });
      const data = await response.json();
      if (data.success) {
        alert("Query answered successfully.");
        setAnswer(""); // Clear the input field
        fetchQueries(); // Refresh the queries list
      } else {
        alert(data.message || "Failed to answer the query.");
      }
    } catch (error) {
      console.error("Error answering query:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (index) => {
    setExpanded(expanded === index ? null : index);
  };

  useEffect(() => {
    fetchQueries(); // Fetch top queries on component load
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Customer Queries
      </Typography>

      {/* Create Query Section */}
      {!(user.info.type === "customer_rep") && (
        <Box display="flex" gap={2} mb={4} sx={{ margin: "1rem" }}>
          <TextField
            label="Ask a question"
            value={newQuery}
            onChange={(e) => setNewQuery(e.target.value)}
            fullWidth
          />
          <Button variant="contained" color="primary" onClick={handleCreateQuery}>
            Ask
          </Button>
        </Box>
      )}

      {/* Search Section */}
      <Box display="flex" gap={2} mb={4} sx={{ margin: "1rem" }}>
        <TextField
          label="Search Keywords"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          fullWidth
        />
        <Button variant="contained" color="primary" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      {/* Results Section */}
      {loading ? (
        <CircularProgress />
      ) : (
        <Paper>
          <List>
            {queries.map((query, index) => (
              <React.Fragment key={query.query_id}>
                <ListItemButton onClick={() => toggleExpand(index)}>
                  <ListItemText
                    primary={query.question}
                    secondary={
                      <>
                        <Typography
                          color={query.answer ? "green" : "red"}
                          fontWeight="bold"
                          display="inline"
                        >
                          {query.answer ? "Resolved" : "No answer"}
                        </Typography>
                        {" - "}
                        <Typography display="inline" color="textSecondary">
                          Customer: {query.customer_id}
                        </Typography>
                      </>
                    }
                  />
                  {expanded === index ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={expanded === index} timeout="auto" unmountOnExit>
                  <Box px={4} py={2}>
                    <Typography variant="body1">
                      <strong>Response:</strong>{" "}
                      {query.answer || "This query has not been answered yet."}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Created:</strong>{" "}
                      {new Date(query.created_time).toLocaleString()}
                      {query.answered_time && (
                        <>
                          {" | "}
                          <strong>Answered:</strong>{" "}
                          {new Date(query.answered_time).toLocaleString()}
                        </>
                      )}
                    </Typography>
                    {user.info.type === "customer_rep" && !query.answer && (
                      <Box display="flex" flexDirection="column" gap={2} mt={2}>
                        <TextField
                          label="Enter your response"
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          fullWidth
                        />
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleAnswerQuery(query.query_id)}
                        >
                          Submit Response
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Collapse>
              </React.Fragment>
            ))}
            {queries.length === 0 && !loading && (
              <Typography align="center" py={4}>
                No queries available.
              </Typography>
            )}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default Queries;
