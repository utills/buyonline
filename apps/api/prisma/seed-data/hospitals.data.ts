// 130 hospitals across 17 Indian cities
export const HOSPITALS = [
  // ── Mumbai (15) ──────────────────────────────────────────────────────
  { name: 'Apollo Hospital Navi Mumbai',              address: 'Plot 13 Sector 23, Nerul',              city: 'Mumbai', state: 'Maharashtra', pincode: '400706', latitude: 19.0330, longitude: 73.0297 },
  { name: 'Kokilaben Dhirubhai Ambani Hospital',      address: 'Rao Saheb Achutrao Patwardhan Marg',    city: 'Mumbai', state: 'Maharashtra', pincode: '400053', latitude: 19.1310, longitude: 72.8264 },
  { name: 'Lilavati Hospital',                        address: 'A-791 Bandra Reclamation',              city: 'Mumbai', state: 'Maharashtra', pincode: '400050', latitude: 19.0504, longitude: 72.8280 },
  { name: 'Tata Memorial Hospital',                   address: 'Dr E Borges Road, Parel',               city: 'Mumbai', state: 'Maharashtra', pincode: '400012', latitude: 19.0048, longitude: 72.8423 },
  { name: 'Breach Candy Hospital',                    address: '60-A Bhulabhai Desai Road',             city: 'Mumbai', state: 'Maharashtra', pincode: '400026', latitude: 18.9707, longitude: 72.8058 },
  { name: 'Wockhardt Hospital Mumbai',                address: '1877 Dr Anand Rao Nair Marg',           city: 'Mumbai', state: 'Maharashtra', pincode: '400011', latitude: 18.9677, longitude: 72.8253 },
  { name: 'Hiranandani Hospital',                     address: 'Hiranandani Gardens, Powai',            city: 'Mumbai', state: 'Maharashtra', pincode: '400076', latitude: 19.1166, longitude: 72.9061 },
  { name: 'Holy Family Hospital',                     address: 'St Andrews Road, Bandra West',          city: 'Mumbai', state: 'Maharashtra', pincode: '400050', latitude: 19.0512, longitude: 72.8431 },
  { name: 'Jaslok Hospital',                          address: '15 Dr Deshmukh Marg, Pedder Road',      city: 'Mumbai', state: 'Maharashtra', pincode: '400026', latitude: 18.9717, longitude: 72.8052 },
  { name: 'Hinduja Hospital',                         address: 'Veer Savarkar Marg, Mahim',             city: 'Mumbai', state: 'Maharashtra', pincode: '400016', latitude: 19.0580, longitude: 72.8354 },
  { name: 'Nanavati Super Speciality Hospital',       address: 'SV Road, Vile Parle West',              city: 'Mumbai', state: 'Maharashtra', pincode: '400056', latitude: 19.1032, longitude: 72.8336 },
  { name: 'Asian Heart Institute',                    address: 'G/N Block, Bandra Kurla Complex',       city: 'Mumbai', state: 'Maharashtra', pincode: '400051', latitude: 19.0580, longitude: 72.8555 },
  { name: 'Global Hospital Mumbai',                   address: '35 Dr Ernest Borges Road, Parel',       city: 'Mumbai', state: 'Maharashtra', pincode: '400012', latitude: 19.0266, longitude: 72.8557 },
  { name: 'HN Reliance Foundation Hospital',          address: 'Raja Rammohan Roy Road, Prarthana Samaj', city: 'Mumbai', state: 'Maharashtra', pincode: '400004', latitude: 18.9448, longitude: 72.8298 },
  { name: 'Bombay Hospital',                          address: '12 Marine Lines',                       city: 'Mumbai', state: 'Maharashtra', pincode: '400020', latitude: 18.9377, longitude: 72.8354 },

  // ── Delhi NCR (15) ────────────────────────────────────────────────────
  { name: 'AIIMS New Delhi',                          address: 'Sri Aurobindo Marg, Ansari Nagar',      city: 'New Delhi', state: 'Delhi', pincode: '110029', latitude: 28.5672, longitude: 77.2100 },
  { name: 'Max Super Speciality Hospital',            address: '1 Press Enclave Road, Saket',           city: 'New Delhi', state: 'Delhi', pincode: '110017', latitude: 28.5566, longitude: 77.2036 },
  { name: 'Sir Ganga Ram Hospital',                   address: 'Rajinder Nagar',                        city: 'New Delhi', state: 'Delhi', pincode: '110060', latitude: 28.6373, longitude: 77.1901 },
  { name: 'BLK Super Speciality Hospital',            address: 'Pusa Road, Rajinder Nagar',             city: 'New Delhi', state: 'Delhi', pincode: '110005', latitude: 28.6459, longitude: 77.1812 },
  { name: 'Indraprastha Apollo Hospital',             address: 'Mathura Road, Sarita Vihar',            city: 'New Delhi', state: 'Delhi', pincode: '110076', latitude: 28.5317, longitude: 77.2931 },
  { name: 'Fortis Hospital Vasant Kunj',              address: 'Sector B, Pocket 1, Vasant Kunj',       city: 'New Delhi', state: 'Delhi', pincode: '110070', latitude: 28.5247, longitude: 77.1589 },
  { name: 'Primus Super Speciality Hospital',         address: 'Chandragupta Marg, Chanakyapuri',       city: 'New Delhi', state: 'Delhi', pincode: '110021', latitude: 28.5999, longitude: 77.2111 },
  { name: 'Venkateshwar Hospital',                    address: 'Sector 18A, Dwarka',                    city: 'New Delhi', state: 'Delhi', pincode: '110075', latitude: 28.5896, longitude: 77.0453 },
  { name: 'RML Hospital',                             address: 'Park Street, Baba Kharak Singh Marg',   city: 'New Delhi', state: 'Delhi', pincode: '110001', latitude: 28.6329, longitude: 77.1978 },
  { name: 'Medanta The Medicity',                     address: 'CH Baktawar Singh Road, Sector 38',     city: 'Gurugram',  state: 'Haryana', pincode: '122001', latitude: 28.4396, longitude: 77.0427 },
  { name: 'Artemis Hospital Gurugram',                address: 'Sector 51',                             city: 'Gurugram',  state: 'Haryana', pincode: '122001', latitude: 28.4851, longitude: 77.0755 },
  { name: 'Columbia Asia Hospital Gurugram',          address: 'Plot 15 Sector 47',                     city: 'Gurugram',  state: 'Haryana', pincode: '122018', latitude: 28.4699, longitude: 77.0286 },
  { name: 'Paras Hospital Gurugram',                  address: 'C-1 Sushant Lok Phase 1',               city: 'Gurugram',  state: 'Haryana', pincode: '122002', latitude: 28.4740, longitude: 77.0893 },
  { name: 'Fortis Hospital Noida',                    address: 'B-22 Sector 62',                        city: 'Noida',     state: 'Uttar Pradesh', pincode: '201301', latitude: 28.6245, longitude: 77.3634 },
  { name: 'Jaypee Hospital Noida',                    address: 'Sector 128',                            city: 'Noida',     state: 'Uttar Pradesh', pincode: '201304', latitude: 28.5355, longitude: 77.3910 },

  // ── Bangalore (15) ────────────────────────────────────────────────────
  { name: 'Narayana Health Bangalore',                address: '258/A Bommasandra Industrial Area',     city: 'Bangalore', state: 'Karnataka', pincode: '560099', latitude: 12.8100, longitude: 77.6770 },
  { name: 'Manipal Hospital HAL Airport Road',        address: '98 HAL Airport Road',                   city: 'Bangalore', state: 'Karnataka', pincode: '560017', latitude: 12.9588, longitude: 77.6478 },
  { name: 'Apollo Hospital Bannerghatta',             address: '154/11 Bannerghatta Road',              city: 'Bangalore', state: 'Karnataka', pincode: '560076', latitude: 12.8752, longitude: 77.5958 },
  { name: 'Fortis Hospital Cunningham Road',          address: '14 Cunningham Road',                    city: 'Bangalore', state: 'Karnataka', pincode: '560052', latitude: 12.9808, longitude: 77.5987 },
  { name: 'NIMHANS',                                  address: 'Hosur Road, Lakkasandra',               city: 'Bangalore', state: 'Karnataka', pincode: '560029', latitude: 12.9421, longitude: 77.5967 },
  { name: 'Columbia Asia Hospital Kirloskar',         address: 'Kirloskar Business Park, Hebbal',       city: 'Bangalore', state: 'Karnataka', pincode: '560024', latitude: 12.9940, longitude: 77.5697 },
  { name: 'BGS Gleneagles Global Hospital',           address: 'Uttarahalli Road, Kengeri',             city: 'Bangalore', state: 'Karnataka', pincode: '560060', latitude: 12.8172, longitude: 77.4995 },
  { name: 'Sakra World Hospital',                     address: 'SY 52/2 Devarabeesanahalli',            city: 'Bangalore', state: 'Karnataka', pincode: '560103', latitude: 12.9595, longitude: 77.7011 },
  { name: "St John's Medical College Hospital",       address: 'Sarjapur Road, Koramangala',            city: 'Bangalore', state: 'Karnataka', pincode: '560034', latitude: 12.9367, longitude: 77.6189 },
  { name: 'Sparsh Hospital',                          address: '29/P2 The Hub, Infantry Road',          city: 'Bangalore', state: 'Karnataka', pincode: '560001', latitude: 12.9741, longitude: 77.5933 },
  { name: 'Aster CMI Hospital',                       address: 'NH-44 New Airport Road, Hebbal',        city: 'Bangalore', state: 'Karnataka', pincode: '560092', latitude: 13.0448, longitude: 77.5947 },
  { name: 'Mazumdar Shaw Cancer Centre',              address: 'Bommasandra Industrial Area, Hosur Road', city: 'Bangalore', state: 'Karnataka', pincode: '560099', latitude: 12.8095, longitude: 77.6762 },
  { name: 'MS Ramaiah Hospital',                      address: 'MSRIT Post, MSR Nagar, Mathikere',      city: 'Bangalore', state: 'Karnataka', pincode: '560054', latitude: 13.0125, longitude: 77.5530 },
  { name: 'Cloudnine Hospital Jayanagar',             address: '1533 9th Main Road, Jayanagar',         city: 'Bangalore', state: 'Karnataka', pincode: '560041', latitude: 12.9350, longitude: 77.5827 },
  { name: 'Victoria Hospital Bangalore',              address: 'Ft Victoria Rd, Krishna Rajendra Market', city: 'Bangalore', state: 'Karnataka', pincode: '560002', latitude: 12.9658, longitude: 77.5654 },

  // ── Chennai (10) ──────────────────────────────────────────────────────
  { name: 'Apollo Hospital Greams Lane',              address: '21 Greams Lane, Off Greams Road',       city: 'Chennai', state: 'Tamil Nadu', pincode: '600006', latitude: 13.0614, longitude: 80.2519 },
  { name: 'Fortis Malar Hospital',                    address: '52 1st Main Road, Gandhi Nagar',        city: 'Chennai', state: 'Tamil Nadu', pincode: '600020', latitude: 13.0095, longitude: 80.2563 },
  { name: 'MIOT International',                       address: '4/112 Mount Poonamallee Road, Manapakkam', city: 'Chennai', state: 'Tamil Nadu', pincode: '600089', latitude: 12.9818, longitude: 80.1949 },
  { name: 'Global Hospital Chennai',                  address: '439 Cheran Nagar, Perumbakkam',         city: 'Chennai', state: 'Tamil Nadu', pincode: '600100', latitude: 12.9195, longitude: 80.2130 },
  { name: 'Kauvery Hospital',                         address: '199 Luz Church Road, Mylapore',         city: 'Chennai', state: 'Tamil Nadu', pincode: '600004', latitude: 13.0435, longitude: 80.2670 },
  { name: 'MGM Healthcare',                           address: 'Nelson Manickam Road, Aminjikarai',     city: 'Chennai', state: 'Tamil Nadu', pincode: '600029', latitude: 13.0624, longitude: 80.2228 },
  { name: 'SRM Global Hospital',                      address: 'SRM Nagar, Potheri, Kattankulathur',    city: 'Chennai', state: 'Tamil Nadu', pincode: '603203', latitude: 12.8230, longitude: 80.0440 },
  { name: 'Sri Ramachandra Hospital',                 address: '1 Ramachandra Nagar, Porur',            city: 'Chennai', state: 'Tamil Nadu', pincode: '600116', latitude: 13.0337, longitude: 80.1756 },
  { name: 'Billroth Hospitals',                       address: '43 Lakshmi Talkies Road, Shenoy Nagar', city: 'Chennai', state: 'Tamil Nadu', pincode: '600030', latitude: 13.0820, longitude: 80.2271 },
  { name: 'Apollo Hospital OMR',                      address: 'Old Mahabalipuram Road, Perungudi',     city: 'Chennai', state: 'Tamil Nadu', pincode: '600096', latitude: 12.9459, longitude: 80.2278 },

  // ── Hyderabad (10) ────────────────────────────────────────────────────
  { name: 'KIMS Hospital Hyderabad',                  address: '1-8-31/1 Minister Road, Secunderabad',  city: 'Hyderabad', state: 'Telangana', pincode: '500003', latitude: 17.3997, longitude: 78.4727 },
  { name: 'Yashoda Hospital Hyderabad',               address: 'Raj Bhavan Road, Somajiguda',           city: 'Hyderabad', state: 'Telangana', pincode: '500082', latitude: 17.4287, longitude: 78.4481 },
  { name: 'Apollo Hospital Jubilee Hills',            address: 'Film Nagar, Jubilee Hills',             city: 'Hyderabad', state: 'Telangana', pincode: '500096', latitude: 17.4236, longitude: 78.4184 },
  { name: 'Care Hospital Banjara Hills',              address: 'Road No 1, Banjara Hills',              city: 'Hyderabad', state: 'Telangana', pincode: '500034', latitude: 17.4346, longitude: 78.4497 },
  { name: 'Continental Hospital',                     address: 'Plot No 3 Road No 2, IT & Financial District', city: 'Hyderabad', state: 'Telangana', pincode: '500032', latitude: 17.4042, longitude: 78.3553 },
  { name: 'Maxcure Hospital Hyderabad',               address: 'Punjagutta Circle',                     city: 'Hyderabad', state: 'Telangana', pincode: '500082', latitude: 17.4330, longitude: 78.4496 },
  { name: 'NIMS Hyderabad',                           address: 'Punjagutta, Hyderabad',                 city: 'Hyderabad', state: 'Telangana', pincode: '500082', latitude: 17.3897, longitude: 78.4869 },
  { name: 'Star Hospital Hyderabad',                  address: '8-2-596/5 Road No 10, Banjara Hills',   city: 'Hyderabad', state: 'Telangana', pincode: '500034', latitude: 17.4231, longitude: 78.4451 },
  { name: 'Sunshine Hospital Hyderabad',              address: 'PG Road, Paradise Circle, Secunderabad', city: 'Hyderabad', state: 'Telangana', pincode: '500003', latitude: 17.4381, longitude: 78.3794 },
  { name: 'Medicover Hospital Hitech City',           address: 'Hitech City Main Road',                 city: 'Hyderabad', state: 'Telangana', pincode: '500081', latitude: 17.4448, longitude: 78.3848 },

  // ── Pune (8) ──────────────────────────────────────────────────────────
  { name: 'Ruby Hall Clinic',                         address: '40 Sasoon Road, Camp',                  city: 'Pune', state: 'Maharashtra', pincode: '411001', latitude: 18.5252, longitude: 73.8778 },
  { name: 'Sahyadri Hospital Deccan',                 address: '30-C Erandwane',                        city: 'Pune', state: 'Maharashtra', pincode: '411004', latitude: 18.5089, longitude: 73.8348 },
  { name: 'KEM Hospital Pune',                        address: '489 Rasta Peth',                        city: 'Pune', state: 'Maharashtra', pincode: '411011', latitude: 18.5204, longitude: 73.8567 },
  { name: 'Jehangir Hospital',                        address: '32 Sassoon Road',                       city: 'Pune', state: 'Maharashtra', pincode: '411001', latitude: 18.5292, longitude: 73.8902 },
  { name: 'Deenanath Mangeshkar Hospital',            address: 'Erandwane',                             city: 'Pune', state: 'Maharashtra', pincode: '411004', latitude: 18.5003, longitude: 73.8176 },
  { name: 'Jupiter Hospital Pune',                    address: 'Eastern Express Highway, Baner',        city: 'Pune', state: 'Maharashtra', pincode: '411045', latitude: 18.5697, longitude: 73.9194 },
  { name: 'Noble Hospital Pune',                      address: '153 Magarpatta City Road, Hadapsar',    city: 'Pune', state: 'Maharashtra', pincode: '411013', latitude: 18.4986, longitude: 73.9273 },
  { name: 'Columbia Asia Hospital Pune',              address: 'Survey No 2B1, Hinjewadi Phase 1',      city: 'Pune', state: 'Maharashtra', pincode: '411057', latitude: 18.5898, longitude: 73.7378 },

  // ── Kolkata (10) ──────────────────────────────────────────────────────
  { name: 'Apollo Gleneagles Hospital Kolkata',       address: '58 Canal Circular Road, Kadapara',      city: 'Kolkata', state: 'West Bengal', pincode: '700054', latitude: 22.5388, longitude: 88.3613 },
  { name: 'SSKM Hospital Kolkata',                    address: '244 AJC Bose Road',                     city: 'Kolkata', state: 'West Bengal', pincode: '700020', latitude: 22.5331, longitude: 88.3418 },
  { name: 'AMRI Hospital Salt Lake',                  address: 'JC-16-17 Sector 3, Salt Lake City',     city: 'Kolkata', state: 'West Bengal', pincode: '700098', latitude: 22.5766, longitude: 88.3942 },
  { name: 'Peerless Hospital Kolkata',                address: '360 Panchasayar, Garia',                city: 'Kolkata', state: 'West Bengal', pincode: '700094', latitude: 22.4967, longitude: 88.3781 },
  { name: 'Fortis Hospital Anandapur',                address: '730 Eastern Metropolitan Bypass',       city: 'Kolkata', state: 'West Bengal', pincode: '700107', latitude: 22.4913, longitude: 88.3985 },
  { name: 'Medica Superspecialty Hospital',           address: '127 Mukundapur, EM Bypass',             city: 'Kolkata', state: 'West Bengal', pincode: '700099', latitude: 22.5157, longitude: 88.3979 },
  { name: 'RN Tagore International Institute',        address: '124 EM Bypass, Mukundapur',             city: 'Kolkata', state: 'West Bengal', pincode: '700099', latitude: 22.5344, longitude: 88.3592 },
  { name: 'Belle Vue Clinic',                         address: '9 Dr UN Brahmachari Street, Moulali',   city: 'Kolkata', state: 'West Bengal', pincode: '700017', latitude: 22.5503, longitude: 88.3607 },
  { name: 'Nightingale Hospital Kolkata',             address: '11 Shakespeare Sarani',                 city: 'Kolkata', state: 'West Bengal', pincode: '700071', latitude: 22.5551, longitude: 88.3513 },
  { name: 'ILS Hospital Salt Lake',                   address: 'DN-16 Sector V, Salt Lake',             city: 'Kolkata', state: 'West Bengal', pincode: '700091', latitude: 22.5659, longitude: 88.4317 },

  // ── Ahmedabad (8) ─────────────────────────────────────────────────────
  { name: 'Sterling Hospital Ahmedabad',              address: 'Sterling Hospital Road, Gurukul',       city: 'Ahmedabad', state: 'Gujarat', pincode: '380052', latitude: 23.0313, longitude: 72.5083 },
  { name: 'Apollo Hospital Ahmedabad',                address: 'Plot 1A Bhat GIDC, Gandhinagar',        city: 'Ahmedabad', state: 'Gujarat', pincode: '382428', latitude: 23.0869, longitude: 72.5555 },
  { name: 'Zydus Hospital Ahmedabad',                 address: 'Zydus Hospital Road, Thaltej',          city: 'Ahmedabad', state: 'Gujarat', pincode: '380054', latitude: 23.0622, longitude: 72.5049 },
  { name: 'SAL Hospital Ahmedabad',                   address: 'Drive-In Road, Thaltej',                city: 'Ahmedabad', state: 'Gujarat', pincode: '380054', latitude: 23.0466, longitude: 72.5271 },
  { name: 'UN Mehta Institute of Cardiology',         address: 'Civil Hospital Campus, Asarwa',         city: 'Ahmedabad', state: 'Gujarat', pincode: '380016', latitude: 23.0330, longitude: 72.5869 },
  { name: 'Shalby Multi-Speciality Hospital',         address: 'Opp. Karnavati Club, SG Highway',       city: 'Ahmedabad', state: 'Gujarat', pincode: '380015', latitude: 23.0127, longitude: 72.5084 },
  { name: 'HCG Cancer Hospital Ahmedabad',            address: 'Mithakhali Six Roads, Navrangpura',     city: 'Ahmedabad', state: 'Gujarat', pincode: '380009', latitude: 23.0289, longitude: 72.5548 },
  { name: 'Ahmedabad Civil Hospital',                 address: 'Civil Hospital Campus, Asarwa',         city: 'Ahmedabad', state: 'Gujarat', pincode: '380016', latitude: 23.0419, longitude: 72.6075 },

  // ── Jaipur (6) ────────────────────────────────────────────────────────
  { name: 'Fortis Hospital Jaipur',                   address: 'Jawaharlal Nehru Marg, Malviya Nagar',  city: 'Jaipur', state: 'Rajasthan', pincode: '302017', latitude: 26.8508, longitude: 75.8034 },
  { name: 'SMS Hospital Jaipur',                      address: 'Jawaharlal Nehru Marg',                 city: 'Jaipur', state: 'Rajasthan', pincode: '302004', latitude: 26.9052, longitude: 75.8031 },
  { name: 'Eternal Hospital Jaipur',                  address: 'Jagatpura Road',                        city: 'Jaipur', state: 'Rajasthan', pincode: '302017', latitude: 26.8559, longitude: 75.8166 },
  { name: 'Manipal Hospital Jaipur',                  address: 'Sector 5, Vidhyadhar Nagar',            city: 'Jaipur', state: 'Rajasthan', pincode: '302023', latitude: 26.9327, longitude: 75.7786 },
  { name: 'Narayana Hospital Jaipur',                 address: 'Sector 28, Pratap Nagar',               city: 'Jaipur', state: 'Rajasthan', pincode: '302033', latitude: 26.8623, longitude: 75.7834 },
  { name: 'RUHS College of Medical Sciences',         address: 'Kumbha Marg, Pratap Nagar, Sanganer',   city: 'Jaipur', state: 'Rajasthan', pincode: '302033', latitude: 26.8647, longitude: 75.8280 },

  // ── Lucknow (6) ───────────────────────────────────────────────────────
  { name: 'Sanjay Gandhi PGIMS Lucknow',              address: 'Raebareli Road, Lucknow',               city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226014', latitude: 26.7417, longitude: 80.9932 },
  { name: 'Medanta Hospital Lucknow',                 address: 'Sector A, Pocket 1, Amar Shaheed Path', city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226030', latitude: 26.8537, longitude: 80.9822 },
  { name: 'Sahara Hospital Lucknow',                  address: 'Viraj Khand, Gomti Nagar',              city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226010', latitude: 26.8274, longitude: 80.9902 },
  { name: 'Apollo Medics Super Speciality Hospital',  address: 'Kanpur Lucknow Road, Sector B',         city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226030', latitude: 26.8485, longitude: 81.0118 },
  { name: 'KGMU Lucknow',                             address: 'Shah Mina Road, Chowk',                 city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226003', latitude: 26.9124, longitude: 80.9997 },
  { name: 'Balrampur Hospital Lucknow',               address: 'Golaganj',                              city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226018', latitude: 26.8674, longitude: 80.9461 },

  // ── Kochi (5) ─────────────────────────────────────────────────────────
  { name: 'Amrita Hospital Kochi',                    address: 'AIMS Ponekkara PO, Edappally',          city: 'Kochi', state: 'Kerala', pincode: '682041', latitude: 10.0316, longitude: 76.3090 },
  { name: 'Aster Medcity Kochi',                      address: 'Kuttisahib Road, Cheranalloor',         city: 'Kochi', state: 'Kerala', pincode: '682027', latitude: 9.9453,  longitude: 76.2845 },
  { name: 'Lakeshore Hospital Kochi',                 address: 'NH-47, Maradu',                         city: 'Kochi', state: 'Kerala', pincode: '682304', latitude: 9.9780,  longitude: 76.2947 },
  { name: 'Medical Trust Hospital Kochi',             address: 'MG Road, Ernakulam',                    city: 'Kochi', state: 'Kerala', pincode: '682016', latitude: 9.9830,  longitude: 76.2882 },
  { name: 'KIMS Health Kochi',                        address: 'Anayara PO, Trivandrum Road',           city: 'Kochi', state: 'Kerala', pincode: '695029', latitude: 9.9694,  longitude: 76.2862 },

  // ── Chandigarh (4) ────────────────────────────────────────────────────
  { name: 'PGIMER Chandigarh',                        address: 'Sector 12',                             city: 'Chandigarh', state: 'Chandigarh', pincode: '160012', latitude: 30.7643, longitude: 76.7760 },
  { name: 'Government Medical College Chandigarh',    address: 'Sector 32B',                            city: 'Chandigarh', state: 'Chandigarh', pincode: '160030', latitude: 30.7333, longitude: 76.7794 },
  { name: 'Fortis Hospital Mohali',                   address: 'Phase 8, Industrial Area',              city: 'Mohali',     state: 'Punjab', pincode: '160055', latitude: 30.7304, longitude: 76.7286 },
  { name: 'Max Super Speciality Hospital Mohali',     address: 'Phase 6, Mohali',                       city: 'Mohali',     state: 'Punjab', pincode: '160055', latitude: 30.7273, longitude: 76.7161 },

  // ── Nagpur (4) ────────────────────────────────────────────────────────
  { name: 'Orange City Hospital Nagpur',              address: 'Nagpur-Amravati Road, Kathora Naka',    city: 'Nagpur', state: 'Maharashtra', pincode: '440008', latitude: 21.1458, longitude: 79.0882 },
  { name: 'Lata Mangeshkar Hospital',                 address: 'Nagpur-Amravati Road',                  city: 'Nagpur', state: 'Maharashtra', pincode: '440023', latitude: 21.1382, longitude: 79.0937 },
  { name: 'AIIMS Nagpur',                             address: 'MIHAN, Nagpur',                         city: 'Nagpur', state: 'Maharashtra', pincode: '441108', latitude: 21.0847, longitude: 79.0584 },
  { name: 'Alexis Hospital Nagpur',                   address: 'Koradi Road, Manas Nagar',              city: 'Nagpur', state: 'Maharashtra', pincode: '440030', latitude: 21.1459, longitude: 79.0523 },

  // ── Indore (4) ────────────────────────────────────────────────────────
  { name: 'Bombay Hospital Indore',                   address: 'Ring Road, Indore',                     city: 'Indore', state: 'Madhya Pradesh', pincode: '452010', latitude: 22.7196, longitude: 75.8577 },
  { name: 'Choithram Hospital Indore',                address: 'Manik Bagh Road',                       city: 'Indore', state: 'Madhya Pradesh', pincode: '452001', latitude: 22.7196, longitude: 75.8766 },
  { name: 'Apollo Sage Hospital Indore',              address: 'Scheme No 74C, Vijay Nagar',            city: 'Indore', state: 'Madhya Pradesh', pincode: '452010', latitude: 22.7481, longitude: 75.8897 },
  { name: 'CHL Hospital Indore',                      address: 'AB Road, LIG Square',                   city: 'Indore', state: 'Madhya Pradesh', pincode: '452008', latitude: 22.7203, longitude: 75.8673 },

  // ── Bhopal (4) ────────────────────────────────────────────────────────
  { name: 'AIIMS Bhopal',                             address: 'Saket Nagar',                           city: 'Bhopal', state: 'Madhya Pradesh', pincode: '462020', latitude: 23.1889, longitude: 77.4286 },
  { name: 'Hamidia Hospital Bhopal',                  address: 'Royal Market, Sultania Road',           city: 'Bhopal', state: 'Madhya Pradesh', pincode: '462001', latitude: 23.2529, longitude: 77.4164 },
  { name: 'Bansal Hospital Bhopal',                   address: 'CB-7 State Bank Colony, New Market',    city: 'Bhopal', state: 'Madhya Pradesh', pincode: '462016', latitude: 23.2323, longitude: 77.4340 },
  { name: "People's Hospital Bhopal",                 address: 'Narmadapuram Road, Bhopal',             city: 'Bhopal', state: 'Madhya Pradesh', pincode: '462001', latitude: 23.2215, longitude: 77.4231 },

  // ── Coimbatore (3) ────────────────────────────────────────────────────
  { name: 'PSG Hospitals Coimbatore',                 address: 'Peelamedu',                             city: 'Coimbatore', state: 'Tamil Nadu', pincode: '641004', latitude: 11.0168, longitude: 77.0107 },
  { name: 'Kovai Medical Centre',                     address: '99 Avanashi Road',                      city: 'Coimbatore', state: 'Tamil Nadu', pincode: '641014', latitude: 11.0126, longitude: 76.9780 },
  { name: 'Ganga Hospital',                           address: '313 Mettupalayam Road',                 city: 'Coimbatore', state: 'Tamil Nadu', pincode: '641043', latitude: 11.0268, longitude: 76.9756 },

  // ── Visakhapatnam (3) ─────────────────────────────────────────────────
  { name: 'KIMS Hospital Visakhapatnam',              address: '1-100 Bheemunipatnam Road, Arilova',    city: 'Visakhapatnam', state: 'Andhra Pradesh', pincode: '530040', latitude: 17.7231, longitude: 83.3012 },
  { name: 'Seven Hills Hospital Vizag',               address: 'Rockdale Layout, Visakhapatnam',        city: 'Visakhapatnam', state: 'Andhra Pradesh', pincode: '530002', latitude: 17.7245, longitude: 83.3297 },
  { name: 'Gayatri Hospital Vizag',                   address: 'Waltair Main Road',                     city: 'Visakhapatnam', state: 'Andhra Pradesh', pincode: '530002', latitude: 17.6973, longitude: 83.2968 },
];
