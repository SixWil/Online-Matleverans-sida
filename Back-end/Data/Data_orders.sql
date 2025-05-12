--
-- PostgreSQL database dump
--

-- Dumped from database version 15.4
-- Dumped by pg_dump version 15.4

-- Started on 2025-05-09 13:31:23

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 215 (class 1259 OID 24640)
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    food text NOT NULL,
    price_per integer NOT NULL,
    ammount integer NOT NULL,
    account integer NOT NULL,
    batch integer NOT NULL
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- TOC entry 214 (class 1259 OID 24639)
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.orders_id_seq OWNER TO postgres;

--
-- TOC entry 3332 (class 0 OID 0)
-- Dependencies: 214
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- TOC entry 3180 (class 2604 OID 24643)
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- TOC entry 3326 (class 0 OID 24640)
-- Dependencies: 215
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, food, price_per, ammount, account, batch) FROM stdin;
33	Moln	2000	2	123	1
34	Centaur	35000	1	123	1
35	Slag	450	1	123	1
36	Moln	2000	1	123	2
37	Slag	450	1	123	2
38	Centaur	35000	2	123	2
39	Moln	2000	1	123	3
40	Moln	2000	1	123	4
41	Moln	2000	2	123	5
42	Moln	2000	2	123	6
43	Moln	2000	3	123	7
44	Moln	2000	3	123	8
45	Centaur	35000	23	123	9
46	Slag	450	30	123	9
47	Slag	450	10	123	10
48	Moln	2000	0	123	11
49	Moln	2000	1	123	12
50	Slag	450	4	123	13
51	Moln	2000	1	123	14
52	Moln	2000	1	123	15
53	Slag	450	1	123	16
54	Centaur	35000	1	123	17
55	Moln	2000	2	123	17
56	Moln	2000	5	123	18
57	Moln	2000	9	123	19
58	Moln	2000	5	123	20
59	Slag	450	1	123	21
60	Centaur	35000	2	123	21
61	Moln	2000	3	123	21
62	Moln	2000	33	123	22
63	Moln	2000	10	123	23
64	Centaur	35000	5	123	23
65	Slag	450	6	123	23
66	ChocladPudding	35	21	123	23
67	AvacadoToast	50	13	123	23
68	RäkSoppa	60	10	123	23
69	Oxbringa	200	16	123	23
70	Kyckling	150	14	123	23
71	Revben	350	7	123	23
72	Moln	2000	5	123	24
73	Centaur	35000	5	123	24
74	Slag	450	5	123	24
75	Oxbringa	200	4	1	25
\.


--
-- TOC entry 3333 (class 0 OID 0)
-- Dependencies: 214
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 75, true);


--
-- TOC entry 3182 (class 2606 OID 24647)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


-- Completed on 2025-05-09 13:31:23

--
-- PostgreSQL database dump complete
--

