import { formatCurrency } from '../utils/formatCurrency';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  CheckCircle2, 
  FileText, 
  Loader2, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Train, 
  CreditCard, 
  User, 
  ChevronRight, 
  Info,
  MapPin,
  Users,
  Flame,
  Droplet,
  Wifi,
  Plane,
  Bus,
  Building,
  Calendar,
  Smartphone
} from 'lucide-react';
import { cn } from '../utils';

const BOARDS_BY_STATE: Record<string, string[]> = {
  'Maharashtra': ['MSEDCL (Mahavitaran)', 'Adani Electricity Mumbai', 'Tata Power Mumbai', 'BEST'],
  'Delhi': ['BSES Rajdhani Power Limited', 'BSES Yamuna Power Limited', 'Tata Power - DDL', 'NDMC'],
  'Uttar Pradesh': ['UPPCL - Urban', 'UPPCL - Rural', 'Torrent Power - Agra', 'Torrent Power - Kanpur'],
  'Karnataka': ['BESCOM', 'HESCOM', 'GESCOM', 'MESCOM', 'CESC Mysore'],
  'Gujarat': ['DGVCL', 'MGVCL', 'PGVCL', 'UGVCL', 'Torrent Power']
};

const METRO_STATIONS: Record<string, string[]> = {
  'Delhi Metro (DMRC)': ['Rajiv Chowk', 'Dwarka Sector 21', 'Noida Electronic City', 'Kashmere Gate', 'Huda City Centre', 'IGI Airport'],
  'Mumbai Metro (MMRDA)': ['Versova', 'Andheri', 'Ghatkopar', 'Gundavali', 'Dahisar East', 'DN Nagar'],
  'Bangalore Metro (BMRCL)': ['Majestic (Kempegowda)', 'Indiranagar', 'Whitefield', 'Yelachenahalli', 'Kengeri', 'MG Road'],
  'Hyderabad Metro (HMR)': ['Miyapur', 'Ameerpet', 'L.B. Nagar', 'Nagole', 'Raidurg', 'Secunderabad East']
};

const INSURANCE_PROVIDERS = {
  life: ['LIC of India', 'HDFC Life Insurance', 'ICICI Prudential Life', 'SBI Life Insurance', 'Max Life Insurance'],
  health: ['Star Health & Allied Insurance', 'Niva Bupa Health Insurance', 'Care Health Insurance', 'HDFC ERGO General Insurance', 'ICICI Lombard']
};

const GAS_PROVIDERS = ['Indane Gas (IOCL)', 'HP Gas', 'Bharat Gas', 'Mahanagar Gas Ltd', 'Adani Total Gas', 'Indraprastha Gas (IGL)'];
const WATER_BOARDS = ['Delhi Jal Board (DJB)', 'Brihanmumbai Municipal Corp (BMC)', 'Bangalore Water Supply (BWSSB)', 'UP Jal Nigam', 'Hyderabad Metro Water (HMWS&SB)'];
const BROADBAND_PROVIDERS = ['Airtel Xstream Fiber', 'JioFiber Broadband', 'Tata Play Fiber', 'ACT Fibernet', 'Hathway Cable & Datacom'];

const CITIES_LIST = [
  { code: 'DEL', name: 'Delhi (DEL - IGI Airport)', bus: 'Delhi' },
  { code: 'BOM', name: 'Mumbai (BOM - Chhatrapati Shivaji)', bus: 'Mumbai' },
  { code: 'BLR', name: 'Bangalore (BLR - Kempegowda)', bus: 'Bangalore' },
  { code: 'HYD', name: 'Hyderabad (HYD - Rajiv Gandhi)', bus: 'Hyderabad' },
  { code: 'PNQ', name: 'Pune (PNQ - Lohegaon)', bus: 'Pune' },
  { code: 'MAA', name: 'Chennai (MAA - Chennai International)', bus: 'Chennai' },
  { code: 'CCU', name: 'Kolkata (CCU - Netaji Subhash)', bus: 'Kolkata' },
  { code: 'GOI', name: 'Goa (GOI - Dabolim Airport)', bus: 'Goa' },
  { code: 'JPR', name: 'Jaipur (JPR - Sanganeer)', bus: 'Jaipur' }
];

interface ElectricityBillModuleProps {
  onProceed: (amount: string, details: string) => void;
  onDisconnect: () => void;
}

export function ElectricityBillModule({ onProceed, onDisconnect }: ElectricityBillModuleProps) {
  // Navigation: 'home' | 'electricity' | 'insurance' | 'metro' | 'card_recharge' | 'gas' | 'water' | 'broadband' | 'bus' | 'flight' | 'hotel' | 'mobile_recharge'
  const [activeService, setActiveService] = useState<'home' | 'electricity' | 'insurance' | 'metro' | 'card_recharge' | 'gas' | 'water' | 'broadband' | 'bus' | 'flight' | 'hotel' | 'mobile_recharge'>('home');

  const [fetching, setFetching] = useState(false);
  const [fetchedBill, setFetchedBill] = useState<{
    name: string;
    amount: string;
    billDate?: string;
    dueDate?: string;
    details: string;
  } | null>(null);

  // 1. Electricity State
  const [selectedState, setSelectedState] = useState(() => localStorage.getItem('electricity_selected_state') || '');
  const [selectedBoard, setSelectedBoard] = useState(() => localStorage.getItem('electricity_selected_board') || '');
  const [caNumber, setCaNumber] = useState(() => localStorage.getItem('electricity_ca_number') || '');
  const [isFirstStateEffect, setIsFirstStateEffect] = useState(true);

  useEffect(() => {
    if (isFirstStateEffect) {
      setIsFirstStateEffect(false);
      return;
    }
    setSelectedBoard('');
    setFetchedBill(null);
  }, [selectedState]);

  useEffect(() => {
    setFetchedBill(null);
  }, [caNumber, selectedBoard]);

  // 2. Insurance State
  const [insuranceType, setInsuranceType] = useState<'life' | 'health'>('life');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');

  useEffect(() => {
    setSelectedProvider('');
    setFetchedBill(null);
  }, [insuranceType]);

  useEffect(() => {
    setFetchedBill(null);
  }, [selectedProvider, policyNumber]);

  // 3. Metro Ticket State
  const [metroNetwork, setMetroNetwork] = useState('Delhi Metro (DMRC)');
  const [sourceStation, setSourceStation] = useState('');
  const [destStation, setDestStation] = useState('');
  const [passengerCount, setPassengerCount] = useState(1);

  useEffect(() => {
    setSourceStation('');
    setDestStation('');
    setFetchedBill(null);
  }, [metroNetwork]);

  useEffect(() => {
    setFetchedBill(null);
  }, [sourceStation, destStation, passengerCount]);

  // 4. Smart Card / FASTag Recharge State
  const [cardType, setCardType] = useState('Delhi Metro Smart Card');
  const [cardId, setCardId] = useState('');
  const [rechargeAmount, setRechargeAmount] = useState('200');

  useEffect(() => {
    setFetchedBill(null);
  }, [cardType, cardId, rechargeAmount]);

  // 5. Household Additional Utilities States (Gas, Water, Broadband)
  const [gasProvider, setGasProvider] = useState('');
  const [gasLpgId, setGasLpgId] = useState('');
  useEffect(() => { setFetchedBill(null); }, [gasProvider, gasLpgId]);

  const [waterBoard, setWaterBoard] = useState('');
  const [waterCan, setWaterCan] = useState('');
  useEffect(() => { setFetchedBill(null); }, [waterBoard, waterCan]);

  const [broadbandProvider, setBroadbandProvider] = useState('');
  const [broadbandId, setBroadbandId] = useState('');
  useEffect(() => { setFetchedBill(null); }, [broadbandProvider, broadbandId]);

  // 6. Bus State
  const [busSource, setBusSource] = useState('Delhi');
  const [busDest, setBusDest] = useState('Jaipur');
  const [busDate, setBusDate] = useState('');
  const [busType, setBusType] = useState('AC Sleeper');
  const [busPassengers, setBusPassengers] = useState(1);
  useEffect(() => { setFetchedBill(null); }, [busSource, busDest, busDate, busType, busPassengers]);

  // 7. Flight State
  const [flightSource, setFlightSource] = useState('DEL');
  const [flightDest, setFlightDest] = useState('BOM');
  const [flightDate, setFlightDate] = useState('');
  const [flightClass, setFlightClass] = useState('Economy');
  const [flightPassengers, setFlightPassengers] = useState(1);
  useEffect(() => { setFetchedBill(null); }, [flightSource, flightDest, flightDate, flightClass, flightPassengers]);

  // 8. Hotel State
  const [hotelCity, setHotelCity] = useState('Delhi');
  const [hotelCheckIn, setHotelCheckIn] = useState('');
  const [hotelCheckOut, setHotelCheckOut] = useState('');
  const [hotelRooms, setHotelRooms] = useState(1);
  const [hotelGuests, setHotelGuests] = useState(1);
  const [hotelTier, setHotelTier] = useState('Premium Executive 3-Star');
  useEffect(() => { setFetchedBill(null); }, [hotelCity, hotelCheckIn, hotelCheckOut, hotelRooms, hotelGuests, hotelTier]);

  // 9. Mobile Recharge State
  const [mobileNo, setMobileNo] = useState('');
  const [mobileOperator, setMobileOperator] = useState('Jio');
  const [mobileCircle, setMobileCircle] = useState('Delhi NCR');
  const [mobileAmount, setMobileAmount] = useState('239');
  useEffect(() => { setFetchedBill(null); }, [mobileNo, mobileOperator, mobileCircle, mobileAmount]);

  // Automated ASL features: prefix auto-detection
  useEffect(() => {
    if (mobileNo.length >= 4) {
      const prefix = mobileNo.substring(0, 4);
      if (prefix === '9812') {
        setMobileOperator('Airtel');
        setMobileCircle('Haryana');
      } else if (prefix === '9999') {
        setMobileOperator('Jio');
        setMobileCircle('Delhi NCR');
      } else if (prefix === '8888') {
        setMobileOperator('Vi');
        setMobileCircle('Mumbai');
      } else if (prefix === '7777') {
        setMobileOperator('BSNL');
        setMobileCircle('Karnataka');
      }
    }
  }, [mobileNo]);

  // General Fetch Action Simulator
  const handleFetchService = () => {
    setFetching(true);
    setFetchedBill(null);

    setTimeout(() => {
      const mockNames = ['Rahul Sharma', 'Priya Kapoor', 'Amit Desai', 'Neha Reddy', 'Vikram Singh', 'Aishwarya Sen'];
      const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
      const now = new Date();

      if (activeService === 'electricity') {
        const randomAmount = Math.floor(Math.random() * 3100) + 400;
        const billDate = new Date();
        billDate.setDate(now.getDate() - 10);
        const dueDate = new Date();
        dueDate.setDate(now.getDate() + 5);

        setFetchedBill({
          name: randomName,
          amount: randomAmount.toString(),
          billDate: billDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          dueDate: dueDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          details: `BBPS State: ${selectedState} | Board: ${selectedBoard} | CA: ${caNumber}`
        });
      } else if (activeService === 'insurance') {
        // Premiums are usually higher
        const randomAmount = Math.floor(Math.random() * 8500) + 1500;
        const dueDate = new Date();
        dueDate.setDate(now.getDate() + 14); // 2 weeks grace period

        setFetchedBill({
          name: randomName,
          amount: randomAmount.toString(),
          dueDate: dueDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          details: `Insurance Premium: ${insuranceType.toUpperCase()} | Provider: ${selectedProvider} | Policy: ${policyNumber}`
        });
      } else if (activeService === 'metro') {
        // Metro tickets cost around 20-80 per passenger
        const farePerPassenger = Math.floor(Math.random() * 50) + 30;
        const totalFare = farePerPassenger * passengerCount;

        setFetchedBill({
          name: 'Transit Passenger',
          amount: totalFare.toString(),
          details: `Transit Smart QR Ticket | Network: ${metroNetwork} | Route: ${sourceStation} ➔ ${destStation} | Passengers: ${passengerCount}`
        });
      } else if (activeService === 'card_recharge') {
        // Recharge amount is directly entered
        const amt = parseFloat(rechargeAmount) || 200;
        setFetchedBill({
          name: 'Smart Card Holder',
          amount: amt.toString(),
          details: `Smart Transit Recharge | Card Type: ${cardType} | ID: ${cardId}`
        });
      } else if (activeService === 'gas') {
        const amt = Math.floor(Math.random() * 200) + 950; // LPG bookings are usually around ₹950-1150
        setFetchedBill({
          name: randomName,
          amount: amt.toString(),
          dueDate: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          details: `LPG Cylinder Booking | Provider: ${gasProvider} | Consumer ID: ${gasLpgId}`
        });
      } else if (activeService === 'water') {
        const amt = Math.floor(Math.random() * 400) + 180; // Water bills are usually ₹180-580
        setFetchedBill({
          name: randomName,
          amount: amt.toString(),
          dueDate: new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          details: `Water Bill Settlement | Board: ${waterBoard} | Connection No: ${waterCan}`
        });
      } else if (activeService === 'broadband') {
        const amt = Math.floor(Math.random() * 500) + 599; // Broadband packs are ₹599-1099
        setFetchedBill({
          name: randomName,
          amount: amt.toString(),
          dueDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          details: `Broadband Connection Bill | Provider: ${broadbandProvider} | Account Number: ${broadbandId}`
        });
      } else if (activeService === 'bus') {
        const seatFare = Math.floor(Math.random() * 350) + 450; // ₹450-800 per seat
        const total = seatFare * busPassengers;
        setFetchedBill({
          name: 'Bus Transit Passenger',
          amount: total.toString(),
          details: `Interstate Bus Ticket | Route: ${busSource} ➔ ${busDest} | Date: ${busDate || 'Immediate Departure'} | Type: ${busType} | Seats: ${busPassengers} Pax`
        });
      } else if (activeService === 'flight') {
        const baseClassFare = flightClass === 'Business' ? 12500 : flightClass === 'Premium Economy' ? 7200 : 4200;
        const flexFare = Math.floor(Math.random() * 1200) - 300;
        const total = (baseClassFare + flexFare) * flightPassengers;
        setFetchedBill({
          name: 'Aeroplane Flight Passenger',
          amount: total.toString(),
          details: `Flight Ticket QR | Sector: ${flightSource} ➔ ${flightDest} | Departure: ${flightDate || 'Immediate'} | Cabin Class: ${flightClass} | Seats: ${flightPassengers} Pax`
        });
      } else if (activeService === 'hotel') {
        const roomRate = hotelTier === 'Grand Luxury 5-Star' ? 9500 : hotelTier === 'Premium Executive 3-Star' ? 3800 : 1600;
        let nights = 1;
        if (hotelCheckIn && hotelCheckOut) {
          const d1 = new Date(hotelCheckIn);
          const d2 = new Date(hotelCheckOut);
          const diff = Math.abs(d2.getTime() - d1.getTime());
          nights = Math.ceil(diff / (1000 * 60 * 60 * 24)) || 1;
        }
        const total = roomRate * hotelRooms * nights;
        setFetchedBill({
          name: 'Hotel Lodging Guest',
          amount: total.toString(),
          details: `Hotel Lodging Check-in | Destination: ${hotelCity} | Check-in: ${hotelCheckIn || 'TBD'} | Nights: ${nights} | Rooms: ${hotelRooms} | Guests: ${hotelGuests} | Tier: ${hotelTier}`
        });
      } else if (activeService === 'mobile_recharge') {
        const amt = parseFloat(mobileAmount) || 239;
        setFetchedBill({
          name: `Prepaid Subscriber (+91 ${mobileNo})`,
          amount: amt.toString(),
          details: `Mobile Prepaid Recharge | Number: +91 ${mobileNo} | Operator: ${mobileOperator} | Circle: ${mobileCircle} | Plan: ₹${amt}`
        });
      }

      setFetching(false);
    }, 200);
  };

  // Back to Main Hub
  const handleBackToHome = () => {
    setActiveService('home');
    setFetchedBill(null);
  };

  return (
    <div className="space-y-5">
      {/* HEADER BAR */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-100 flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" /> NPCI Utility & Transit System
          </h3>
          <p className="text-[9px] text-slate-400 mt-0.5">
            Instant decentralized clearance for public utilities, premium insurances, and smart transit cards.
          </p>
        </div>
        {activeService !== 'home' ? (
          <button
            type="button"
            onClick={handleBackToHome}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl text-[9px] font-black uppercase tracking-wider transition cursor-pointer border border-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-indigo-400" /> Services Menu
          </button>
        ) : (
          <button
            type="button"
            onClick={onDisconnect}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 rounded-xl text-[9px] font-black uppercase text-slate-400 tracking-wider transition cursor-pointer"
          >
            Disconnect Node
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* SERVICES MAIN HUB MENU */}
        {activeService === 'home' && (
          <motion.div
            key="home-grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* 1. Category: Utilities */}
            <div>
              <span className="block text-[9.5px] uppercase font-black text-amber-400 tracking-wider mb-2.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Household Bills & Utilities
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Electricity */}
                <button
                  onClick={() => setActiveService('electricity')}
                  className="bg-slate-950/40 hover:bg-slate-900/60 border border-slate-850/80 hover:border-amber-500/30 rounded-2xl p-4 text-left transition duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[125px] cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-all duration-300" />
                  <div className="w-8 h-8 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                    <Zap className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="mt-3">
                    <span className="block text-xs font-black uppercase tracking-wider text-slate-200">Electricity Bill</span>
                    <span className="block text-[8.5px] text-slate-400 mt-0.5 leading-normal">State boards electrical invoices.</span>
                  </div>
                </button>

                {/* LPG Gas Cylinder */}
                <button
                  onClick={() => setActiveService('gas')}
                  className="bg-slate-950/40 hover:bg-slate-900/60 border border-slate-850/80 hover:border-orange-500/30 rounded-2xl p-4 text-left transition duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[125px] cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/5 rounded-full blur-xl group-hover:bg-orange-500/10 transition-all duration-300" />
                  <div className="w-8 h-8 bg-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/20">
                    <Flame className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="mt-3">
                    <span className="block text-xs font-black uppercase tracking-wider text-slate-200">LPG Gas Cylinder</span>
                    <span className="block text-[8.5px] text-slate-400 mt-0.5 leading-normal">Book and pay cooking gas cylinders.</span>
                  </div>
                </button>

                {/* Water Bill */}
                <button
                  onClick={() => setActiveService('water')}
                  className="bg-slate-950/40 hover:bg-slate-900/60 border border-slate-850/80 hover:border-teal-500/30 rounded-2xl p-4 text-left transition duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[125px] cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-teal-500/5 rounded-full blur-xl group-hover:bg-teal-500/10 transition-all duration-300" />
                  <div className="w-8 h-8 bg-teal-500/10 rounded-xl flex items-center justify-center border border-teal-500/20">
                    <Droplet className="w-4 h-4 text-teal-400" />
                  </div>
                  <div className="mt-3">
                    <span className="block text-xs font-black uppercase tracking-wider text-slate-200">Water connection</span>
                    <span className="block text-[8.5px] text-slate-400 mt-0.5 leading-normal">Pay civic water authority bills.</span>
                  </div>
                </button>

                {/* Broadband & DTH */}
                <button
                  onClick={() => setActiveService('broadband')}
                  className="bg-slate-950/40 hover:bg-slate-900/60 border border-slate-850/80 hover:border-indigo-500/30 rounded-2xl p-4 text-left transition duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[125px] cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-all duration-300" />
                  <div className="w-8 h-8 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                    <Wifi className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="mt-3">
                    <span className="block text-xs font-black uppercase tracking-wider text-slate-200">Broadband & DTH</span>
                    <span className="block text-[8.5px] text-slate-400 mt-0.5 leading-normal">Instant recharges for fiber nets.</span>
                  </div>
                </button>

                {/* Mobile Recharge */}
                <button
                  onClick={() => setActiveService('mobile_recharge')}
                  className="bg-slate-950/40 hover:bg-slate-900/60 border border-slate-850/80 hover:border-violet-500/30 rounded-2xl p-4 text-left transition duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[125px] cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-violet-500/5 rounded-full blur-xl group-hover:bg-violet-500/10 transition-all duration-300" />
                  <div className="w-8 h-8 bg-violet-500/10 rounded-xl flex items-center justify-center border border-violet-500/20">
                    <Smartphone className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="mt-3">
                    <span className="block text-xs font-black uppercase tracking-wider text-slate-200">Mobile Recharge</span>
                    <span className="block text-[8.5px] text-slate-400 mt-0.5 leading-normal">Truly Unlimited prepaid recharges.</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Category: Insurance & Protection */}
            <div>
              <span className="block text-[9.5px] uppercase font-black text-emerald-400 tracking-wider mb-2.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Life & Health Protection
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Insurances */}
                <button
                  onClick={() => setActiveService('insurance')}
                  className="bg-slate-950/40 hover:bg-slate-900/60 border border-slate-850/80 hover:border-emerald-500/30 rounded-2xl p-4 text-left transition duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[110px] cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all duration-300" />
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 shrink-0">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <span className="block text-xs font-black uppercase tracking-wider text-slate-200">Life & Health Insurance</span>
                      <span className="block text-[9px] text-slate-400 mt-0.5 leading-normal">Instantly fetch policies & settle premium dues.</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* 3. Category: Commute & Smart Cards */}
            <div>
              <span className="block text-[9.5px] uppercase font-black text-sky-400 tracking-wider mb-2.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" /> Transit & Commuter Nodes
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Metro Ticket QR */}
                <button
                  onClick={() => setActiveService('metro')}
                  className="bg-slate-950/40 hover:bg-slate-900/60 border border-slate-850/80 hover:border-sky-500/30 rounded-2xl p-4 text-left transition duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[110px] cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-xl group-hover:bg-sky-500/10 transition-all duration-300" />
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center border border-sky-500/20 shrink-0">
                      <Train className="w-5 h-5 text-sky-400" />
                    </div>
                    <div>
                      <span className="block text-xs font-black uppercase tracking-wider text-slate-200">Metro Ticket QR</span>
                      <span className="block text-[9px] text-slate-400 mt-0.5 leading-normal">Book contactless transit QR boarding tickets instantly.</span>
                    </div>
                  </div>
                </button>

                {/* Smart Cards & FASTag */}
                <button
                  onClick={() => setActiveService('card_recharge')}
                  className="bg-slate-950/40 hover:bg-slate-900/60 border border-slate-850/80 hover:border-blue-500/30 rounded-2xl p-4 text-left transition duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[110px] cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-all duration-300" />
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 shrink-0">
                      <CreditCard className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <span className="block text-xs font-black uppercase tracking-wider text-slate-200">Smart Cards & FASTag</span>
                      <span className="block text-[9px] text-slate-400 mt-0.5 leading-normal">Top up commuter cards, NCMC, and Highway FASTags.</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* 4. Category: Global Travel & Hotels */}
            <div>
              <span className="block text-[9.5px] uppercase font-black text-rose-450 tracking-wider mb-2.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> Travel Booking & Hotels
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Flights */}
                <button
                  onClick={() => setActiveService('flight')}
                  className="bg-slate-950/40 hover:bg-slate-900/60 border border-slate-850/80 hover:border-cyan-500/30 rounded-2xl p-4 text-left transition duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[125px] cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition-all duration-300" />
                  <div className="w-8 h-8 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20">
                    <Plane className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="mt-3">
                    <span className="block text-xs font-black uppercase tracking-wider text-slate-200">Flight Booking</span>
                    <span className="block text-[8.5px] text-slate-400 mt-0.5 leading-normal">Secure Aeroplane ticket reservations.</span>
                  </div>
                </button>

                {/* Buses */}
                <button
                  onClick={() => setActiveService('bus')}
                  className="bg-slate-950/40 hover:bg-slate-900/60 border border-slate-850/80 hover:border-rose-500/30 rounded-2xl p-4 text-left transition duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[125px] cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-full blur-xl group-hover:bg-rose-500/10 transition-all duration-300" />
                  <div className="w-8 h-8 bg-rose-500/10 rounded-xl flex items-center justify-center border border-rose-500/20">
                    <Bus className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="mt-3">
                    <span className="block text-xs font-black uppercase tracking-wider text-slate-200">Bus Tickets</span>
                    <span className="block text-[8.5px] text-slate-400 mt-0.5 leading-normal">Interstate luxury and Volvo coaches.</span>
                  </div>
                </button>

                {/* Hotels */}
                <button
                  onClick={() => setActiveService('hotel')}
                  className="bg-slate-950/40 hover:bg-slate-900/60 border border-slate-850/80 hover:border-purple-500/30 rounded-2xl p-4 text-left transition duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[125px] cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-all duration-300" />
                  <div className="w-8 h-8 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
                    <Building className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="mt-3">
                    <span className="block text-xs font-black uppercase tracking-wider text-slate-200">Hotel Bookings</span>
                    <span className="block text-[8.5px] text-slate-400 mt-0.5 leading-normal">Cozy stays, 3-star and luxury 5-star lodging.</span>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ELECTRICITY BILL MODULE SUB-VIEW */}
        {activeService === 'electricity' && (
          <motion.div
            key="electricity-form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4 max-w-xl mx-auto"
          >
            <div className="bg-amber-500/5 border border-amber-500/10 p-3.5 rounded-2xl flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-500 shrink-0" />
              <span className="text-[10px] text-slate-300 leading-normal">
                Settle electrical power consumption invoices over the secure NPCI routing network. Supports all major public boards.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">State Jurisdiction</label>
                <select 
                  value={selectedState} 
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-semibold outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="">Select State</option>
                  {Object.keys(BOARDS_BY_STATE).map(state => (
                    <option key={state} value={state} className="bg-slate-900">{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Electricity Distribution Board</label>
                <select 
                  value={selectedBoard} 
                  onChange={(e) => setSelectedBoard(e.target.value)}
                  disabled={!selectedState}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-semibold outline-none focus:border-amber-500 disabled:opacity-50 cursor-pointer"
                >
                  <option value="">Select Board</option>
                  {selectedState && BOARDS_BY_STATE[selectedState]?.map(board => (
                    <option key={board} value={board} className="bg-slate-900">{board}</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedBoard && (
              <div>
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Consumer Account (CA) Number</label>
                <input
                  type="text"
                  placeholder="e.g. 1029384756"
                  value={caNumber}
                  onChange={(e) => setCaNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-100 outline-none focus:border-amber-500"
                />
              </div>
            )}

            {selectedBoard && caNumber.length > 3 && !fetchedBill && (
              <button
                type="button"
                onClick={handleFetchService}
                disabled={fetching}
                className="w-full bg-slate-100 hover:bg-white text-slate-950 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition disabled:opacity-70 mt-2"
              >
                {fetching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Fetching Bill Dues...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 text-amber-500" /> Fetch Invoice Dues
                  </>
                )}
              </button>
            )}

            {/* Render Bill Receipt block */}
            {renderBillBlock()}
          </motion.div>
        )}

        {/* INSURANCES MODULE SUB-VIEW */}
        {activeService === 'insurance' && (
          <motion.div
            key="insurance-form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4 max-w-xl mx-auto"
          >
            <div className="bg-emerald-500/5 border border-emerald-500/10 p-3.5 rounded-2xl flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
              <span className="text-[10px] text-slate-300 leading-normal">
                Settle life policies or health assurance premiums directly via unified clearing. Settle your premiums with Zero transaction fees.
              </span>
            </div>

            {/* Insurance Type Selector */}
            <div>
              <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5 font-bold">Insurance Category</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setInsuranceType('life')}
                  className={cn(
                    "py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer border",
                    insuranceType === 'life' 
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                      : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
                  )}
                >
                  🛡️ Life Insurance
                </button>
                <button
                  type="button"
                  onClick={() => setInsuranceType('health')}
                  className={cn(
                    "py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer border",
                    insuranceType === 'health' 
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                      : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
                  )}
                >
                  🩺 Health Insurance
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Insurance Provider</label>
                <select 
                  value={selectedProvider} 
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-semibold outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="">Select Provider</option>
                  {INSURANCE_PROVIDERS[insuranceType].map(provider => (
                    <option key={provider} value={provider} className="bg-slate-900">{provider}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Policy Number</label>
                <input
                  type="text"
                  placeholder="e.g. POL-9812603346"
                  value={policyNumber}
                  onChange={(e) => setPolicyNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-100 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {selectedProvider && policyNumber.length > 3 && !fetchedBill && (
              <button
                type="button"
                onClick={handleFetchService}
                disabled={fetching}
                className="w-full bg-slate-100 hover:bg-white text-slate-950 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition disabled:opacity-70 mt-2"
              >
                {fetching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Fetching Premium...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Fetch Premium Dues
                  </>
                )}
              </button>
            )}

            {renderBillBlock()}
          </motion.div>
        )}

        {/* METRO QR TICKET MODULE SUB-VIEW */}
        {activeService === 'metro' && (
          <motion.div
            key="metro-form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4 max-w-xl mx-auto"
          >
            <div className="bg-indigo-500/5 border border-indigo-500/10 p-3.5 rounded-2xl flex items-center gap-3">
              <Train className="w-5 h-5 text-indigo-400 shrink-0" />
              <span className="text-[10px] text-slate-300 leading-normal">
                Book smart transit tickets for major Indian metro systems. Generates an authentic entry QR on successful clearance.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Metro Network</label>
                <select 
                  value={metroNetwork} 
                  onChange={(e) => setMetroNetwork(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-semibold outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {Object.keys(METRO_STATIONS).map(net => (
                    <option key={net} value={net} className="bg-slate-900">{net}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Passenger Count</label>
                <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 justify-between">
                  <button
                    type="button"
                    onClick={() => setPassengerCount(prev => Math.max(1, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-sm font-black transition cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xs font-mono font-black text-slate-200 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-indigo-400" /> {passengerCount} Pax
                  </span>
                  <button
                    type="button"
                    onClick={() => setPassengerCount(prev => Math.min(6, prev + 1))}
                    className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-sm font-black transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Source Station</label>
                <select 
                  value={sourceStation} 
                  onChange={(e) => setSourceStation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-semibold outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">Select Boarding</option>
                  {METRO_STATIONS[metroNetwork].map(st => (
                    <option key={st} value={st} disabled={st === destStation} className="bg-slate-900">{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Destination Station</label>
                <select 
                  value={destStation} 
                  onChange={(e) => setDestStation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-semibold outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">Select Alighting</option>
                  {METRO_STATIONS[metroNetwork].map(st => (
                    <option key={st} value={st} disabled={st === sourceStation} className="bg-slate-900">{st}</option>
                  ))}
                </select>
              </div>
            </div>

            {sourceStation && destStation && !fetchedBill && (
              <button
                type="button"
                onClick={handleFetchService}
                disabled={fetching}
                className="w-full bg-slate-100 hover:bg-white text-slate-950 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition disabled:opacity-70 mt-2"
              >
                {fetching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Calculating Transit Fare...
                  </>
                ) : (
                  <>
                    <Train className="w-4 h-4 text-indigo-400" /> Calculate Route & Fare
                  </>
                )}
              </button>
            )}

            {renderBillBlock()}
          </motion.div>
        )}

        {/* TRANSIT SMART CARD / FASTAG RECHARGE SUB-VIEW */}
        {activeService === 'card_recharge' && (
          <motion.div
            key="card-recharge-form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4 max-w-xl mx-auto"
          >
            <div className="bg-blue-500/5 border border-blue-500/10 p-3.5 rounded-2xl flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-blue-400 shrink-0" />
              <span className="text-[10px] text-slate-300 leading-normal">
                Recharge active National Mobility smart cards (NCMC), city transit commuter passes, or electronic highway Fastags directly.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Card / TAG Type</label>
                <select 
                  value={cardType} 
                  onChange={(e) => setCardType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-semibold outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="Delhi Metro Smart Card">Delhi Metro (DMRC) Card</option>
                  <option value="Mumbai One Card">Mumbai One Smart Card</option>
                  <option value="Bangalore Namma Metro Card">Namma Metro Card (BMRCL)</option>
                  <option value="National Common Mobility Card (NCMC)">NCMC Smart Card</option>
                  <option value="ICICI FASTag Card">Highway FASTag (ICICI)</option>
                  <option value="Paytm Highway FASTag">Highway FASTag (Paytm)</option>
                </select>
              </div>

              <div>
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Smart Card / TAG ID Number</label>
                <input
                  type="text"
                  placeholder="e.g. DMRC-102938475"
                  value={cardId}
                  onChange={(e) => setCardId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-100 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Select Recharge Amount</label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {['100', '200', '500', '1000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setRechargeAmount(amt)}
                    className={cn(
                      "py-2 rounded-lg text-xs font-black transition cursor-pointer border",
                      rechargeAmount === amt 
                        ? 'bg-blue-500/10 border-blue-500 text-blue-400' 
                        : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
                    )}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
              <input
                type="number"
                placeholder="Or Enter Custom Amount"
                value={rechargeAmount}
                onChange={(e) => setRechargeAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-blue-500"
              />
            </div>

            {cardId.length > 3 && rechargeAmount && parseFloat(rechargeAmount) >= 50 && !fetchedBill && (
              <button
                type="button"
                onClick={handleFetchService}
                disabled={fetching}
                className="w-full bg-slate-100 hover:bg-white text-slate-950 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition disabled:opacity-70 mt-2"
              >
                {fetching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Initializing Secure Connection...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 text-blue-400" /> Settle Smart Recharge
                  </>
                )}
              </button>
            )}

            {renderBillBlock()}
          </motion.div>
        )}

        {/* LPG GAS CYLINDER BOOKING SUB-VIEW */}
        {activeService === 'gas' && (
          <motion.div
            key="gas-form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4 max-w-xl mx-auto"
          >
            <div className="bg-orange-500/5 border border-orange-500/10 p-3.5 rounded-2xl flex items-center gap-3">
              <Flame className="w-5 h-5 text-orange-500 shrink-0" />
              <span className="text-[10px] text-slate-300 leading-normal">
                Book LPG Cooking Cylinders or settle piped natural gas invoices over the secure BBPS network with immediate digital receipt.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">LPG Gas / Piped Gas Provider</label>
                <select 
                  value={gasProvider} 
                  onChange={(e) => setGasProvider(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-semibold outline-none focus:border-orange-500 cursor-pointer"
                >
                  <option value="">Select Gas Provider</option>
                  {GAS_PROVIDERS.map(prov => (
                    <option key={prov} value={prov} className="bg-slate-900">{prov}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">LPG ID / Consumer ID Number</label>
                <input
                  type="text"
                  placeholder="e.g. LPG-981260334"
                  value={gasLpgId}
                  onChange={(e) => setGasLpgId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-100 outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {gasProvider && gasLpgId.length > 3 && !fetchedBill && (
              <button
                type="button"
                onClick={handleFetchService}
                disabled={fetching}
                className="w-full bg-slate-100 hover:bg-white text-slate-950 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition disabled:opacity-70 mt-2"
              >
                {fetching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Verifying Booking ID...
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4 text-orange-500" /> Book Gas Cylinder
                  </>
                )}
              </button>
            )}

            {renderBillBlock()}
          </motion.div>
        )}

        {/* WATER BILL SUB-VIEW */}
        {activeService === 'water' && (
          <motion.div
            key="water-form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4 max-w-xl mx-auto"
          >
            <div className="bg-teal-500/5 border border-teal-500/10 p-3.5 rounded-2xl flex items-center gap-3">
              <Droplet className="w-5 h-5 text-teal-400 shrink-0" />
              <span className="text-[10px] text-slate-300 leading-normal">
                Settle municipal water supply and sewerage bills instantly with direct ledger clearance and verification.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Water Utility Board</label>
                <select 
                  value={waterBoard} 
                  onChange={(e) => setWaterBoard(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-semibold outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="">Select Utility Board</option>
                  {WATER_BOARDS.map(board => (
                    <option key={board} value={board} className="bg-slate-900">{board}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Consumer / CAN Number</label>
                <input
                  type="text"
                  placeholder="e.g. CAN-304829"
                  value={waterCan}
                  onChange={(e) => setWaterCan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-100 outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {waterBoard && waterCan.length > 3 && !fetchedBill && (
              <button
                type="button"
                onClick={handleFetchService}
                disabled={fetching}
                className="w-full bg-slate-100 hover:bg-white text-slate-950 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition disabled:opacity-70 mt-2"
              >
                {fetching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Fetching Bill Dues...
                  </>
                ) : (
                  <>
                    <Droplet className="w-4 h-4 text-teal-400" /> Fetch Water Invoice
                  </>
                )}
              </button>
            )}

            {renderBillBlock()}
          </motion.div>
        )}

        {/* BROADBAND SUB-VIEW */}
        {activeService === 'broadband' && (
          <motion.div
            key="broadband-form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4 max-w-xl mx-auto"
          >
            <div className="bg-indigo-500/5 border border-indigo-500/10 p-3.5 rounded-2xl flex items-center gap-3">
              <Wifi className="w-5 h-5 text-indigo-400 shrink-0" />
              <span className="text-[10px] text-slate-300 leading-normal">
                Top up high-speed fiber broadband or settle DTH entertainment bills over the decentralized network with instant validation.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Broadband / Fiber Provider</label>
                <select 
                  value={broadbandProvider} 
                  onChange={(e) => setBroadbandProvider(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-semibold outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">Select Service Provider</option>
                  {BROADBAND_PROVIDERS.map(prov => (
                    <option key={prov} value={prov} className="bg-slate-900">{prov}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Subscriber Account ID / Landline No</label>
                <input
                  type="text"
                  placeholder="e.g. BB-981260"
                  value={broadbandId}
                  onChange={(e) => setBroadbandId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {broadbandProvider && broadbandId.length > 3 && !fetchedBill && (
              <button
                type="button"
                onClick={handleFetchService}
                disabled={fetching}
                className="w-full bg-slate-100 hover:bg-white text-slate-950 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition disabled:opacity-70 mt-2"
              >
                {fetching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Siphoning active invoice...
                  </>
                ) : (
                  <>
                    <Wifi className="w-4 h-4 text-indigo-400" /> Fetch Fiber Dues
                  </>
                )}
              </button>
            )}

            {renderBillBlock()}
          </motion.div>
        )}

        {/* BUS TICKET BOOKING SUB-VIEW */}
        {activeService === 'bus' && (
          <motion.div
            key="bus-form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4 max-w-xl mx-auto"
          >
            <div className="bg-rose-500/5 border border-rose-500/10 p-3.5 rounded-2xl flex items-center gap-3">
              <Bus className="w-5 h-5 text-rose-450 shrink-0" />
              <span className="text-[10px] text-slate-300 leading-normal">
                Book express seats, sleeper berths, or premium Volvo Multi-Axle interstate coaches. Instant digital tickets are dispatched upon clearance.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Source Station (From)</label>
                <select 
                  value={busSource} 
                  onChange={(e) => setBusSource(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-semibold outline-none focus:border-rose-500 cursor-pointer"
                >
                  {CITIES_LIST.map(city => (
                    <option key={city.code + 'src'} value={city.bus} disabled={city.bus === busDest} className="bg-slate-900">{city.bus}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Destination Station (To)</label>
                <select 
                  value={busDest} 
                  onChange={(e) => setBusDest(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-semibold outline-none focus:border-rose-500 cursor-pointer"
                >
                  {CITIES_LIST.map(city => (
                    <option key={city.code + 'dst'} value={city.bus} disabled={city.bus === busSource} className="bg-slate-900">{city.bus}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Departure Date</label>
                <input 
                  type="date"
                  value={busDate}
                  onChange={(e) => setBusDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 outline-none focus:border-rose-500"
                />
              </div>

              <div className="md:col-span-1">
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Coach Tier Type</label>
                <select 
                  value={busType} 
                  onChange={(e) => setBusType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-semibold outline-none focus:border-rose-500 cursor-pointer"
                >
                  <option value="AC Sleeper (2+1)" className="bg-slate-900">AC Sleeper (2+1)</option>
                  <option value="Volvo Multi-Axle Semi-Sleeper" className="bg-slate-900">Volvo Multi-Axle Semi-Sleeper</option>
                  <option value="Luxury Seater Non-AC" className="bg-slate-900">Luxury Seater Non-AC</option>
                  <option value="BharatBenz Premium AC Sleeper" className="bg-slate-900">BharatBenz AC Sleeper</option>
                </select>
              </div>

              <div className="md:col-span-1">
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Passengers</label>
                <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 justify-between">
                  <button
                    type="button"
                    onClick={() => setBusPassengers(prev => Math.max(1, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-200 text-sm font-black transition cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xs font-mono font-black text-slate-200">
                    {busPassengers} Seat
                  </span>
                  <button
                    type="button"
                    onClick={() => setBusPassengers(prev => Math.min(6, prev + 1))}
                    className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-200 text-sm font-black transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {busSource && busDest && !fetchedBill && (
              <button
                type="button"
                onClick={handleFetchService}
                disabled={fetching}
                className="w-full bg-slate-100 hover:bg-white text-slate-950 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition disabled:opacity-70 mt-2"
              >
                {fetching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Compiling Coach Availability...
                  </>
                ) : (
                  <>
                    <Bus className="w-4 h-4 text-rose-400" /> Settle Coach Booking
                  </>
                )}
              </button>
            )}

            {renderBillBlock()}
          </motion.div>
        )}

        {/* FLIGHT TICKET BOOKING SUB-VIEW */}
        {activeService === 'flight' && (
          <motion.div
            key="flight-form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4 max-w-xl mx-auto"
          >
            <div className="bg-cyan-500/5 border border-cyan-500/10 p-3.5 rounded-2xl flex items-center gap-3">
              <Plane className="w-5 h-5 text-cyan-400 shrink-0" />
              <span className="text-[10px] text-slate-300 leading-normal">
                Book domestic and international Aeroplane flights. Real-time airline scheduling check and unified ledger settlement.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Origin Airport (From)</label>
                <select 
                  value={flightSource} 
                  onChange={(e) => setFlightSource(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-semibold outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {CITIES_LIST.map(city => (
                    <option key={city.code + 'airsrc'} value={city.code} disabled={city.code === flightDest} className="bg-slate-900">{city.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Destination Airport (To)</label>
                <select 
                  value={flightDest} 
                  onChange={(e) => setFlightDest(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-semibold outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {CITIES_LIST.map(city => (
                    <option key={city.code + 'airdst'} value={city.code} disabled={city.code === flightSource} className="bg-slate-900">{city.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Departure Date</label>
                <input 
                  type="date"
                  value={flightDate}
                  onChange={(e) => setFlightDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="md:col-span-1">
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Cabin Class</label>
                <select 
                  value={flightClass} 
                  onChange={(e) => setFlightClass(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-semibold outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="Economy" className="bg-slate-900">Economy Class</option>
                  <option value="Premium Economy" className="bg-slate-900">Premium Economy</option>
                  <option value="Business" className="bg-slate-900">Business Cabin Class</option>
                </select>
              </div>

              <div className="md:col-span-1">
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Passengers</label>
                <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 justify-between">
                  <button
                    type="button"
                    onClick={() => setFlightPassengers(prev => Math.max(1, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-200 text-sm font-black transition cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xs font-mono font-black text-slate-200">
                    {flightPassengers} Pax
                  </span>
                  <button
                    type="button"
                    onClick={() => setFlightPassengers(prev => Math.min(6, prev + 1))}
                    className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-200 text-sm font-black transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {flightSource && flightDest && !fetchedBill && (
              <button
                type="button"
                onClick={handleFetchService}
                disabled={fetching}
                className="w-full bg-slate-100 hover:bg-white text-slate-950 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition disabled:opacity-70 mt-2"
              >
                {fetching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Fetching Flight Seat Tariffs...
                  </>
                ) : (
                  <>
                    <Plane className="w-4 h-4 text-cyan-400" /> Search & Settle Flight Dues
                  </>
                )}
              </button>
            )}

            {renderBillBlock()}
          </motion.div>
        )}

        {/* HOTEL RESERVATION SUB-VIEW */}
        {activeService === 'hotel' && (
          <motion.div
            key="hotel-form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4 max-w-xl mx-auto"
          >
            <div className="bg-purple-500/5 border border-purple-500/10 p-3.5 rounded-2xl flex items-center gap-3">
              <Building className="w-5 h-5 text-purple-400 shrink-0" />
              <span className="text-[10px] text-slate-300 leading-normal">
                Book premium luxury suites or budget-friendly lodging accommodations directly through verified merchant integrations.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Destination City</label>
                <select 
                  value={hotelCity} 
                  onChange={(e) => setHotelCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-semibold outline-none focus:border-purple-500 cursor-pointer"
                >
                  {CITIES_LIST.map(city => (
                    <option key={city.code + 'hotcity'} value={city.bus} className="bg-slate-900">{city.bus}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Hotel Luxury Class / Tier</label>
                <select 
                  value={hotelTier} 
                  onChange={(e) => setHotelTier(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-semibold outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="Budget Cozy Standard" className="bg-slate-900">Budget Cozy Standard (₹1,500/night)</option>
                  <option value="Premium Executive 3-Star" className="bg-slate-900">Premium Executive 3-Star (₹3,800/night)</option>
                  <option value="Grand Luxury 5-Star" className="bg-slate-900">Grand Luxury 5-Star (₹9,500/night)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Check-In Date</label>
                <input 
                  type="date"
                  value={hotelCheckIn}
                  onChange={(e) => setHotelCheckIn(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Check-Out Date</label>
                <input 
                  type="date"
                  value={hotelCheckOut}
                  onChange={(e) => setHotelCheckOut(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Rooms Count</label>
                <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 justify-between">
                  <button
                    type="button"
                    onClick={() => setHotelRooms(prev => Math.max(1, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-200 text-sm font-black transition cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xs font-mono font-black text-slate-200">
                    {hotelRooms} Room
                  </span>
                  <button
                    type="button"
                    onClick={() => setHotelRooms(prev => Math.min(4, prev + 1))}
                    className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-200 text-sm font-black transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Guests Count</label>
                <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 justify-between">
                  <button
                    type="button"
                    onClick={() => setHotelGuests(prev => Math.max(1, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-200 text-sm font-black transition cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xs font-mono font-black text-slate-200">
                    {hotelGuests} Guest
                  </span>
                  <button
                    type="button"
                    onClick={() => setHotelGuests(prev => Math.min(8, prev + 1))}
                    className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-200 text-sm font-black transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {hotelCity && !fetchedBill && (
              <button
                type="button"
                onClick={handleFetchService}
                disabled={fetching}
                className="w-full bg-slate-100 hover:bg-white text-slate-950 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition disabled:opacity-70 mt-2"
              >
                {fetching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Verifying Hotel Room Status...
                  </>
                ) : (
                  <>
                    <Building className="w-4 h-4 text-purple-400" /> Check Room Availability
                  </>
                )}
              </button>
            )}

            {renderBillBlock()}
          </motion.div>
        )}

        {/* MOBILE RECHARGE SUB-VIEW */}
        {activeService === 'mobile_recharge' && (
          <motion.div
            key="mobile-recharge-form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4 max-w-xl mx-auto"
          >
            <div className="bg-violet-500/5 border border-violet-500/10 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-violet-400 shrink-0" />
                <span className="text-[10px] text-slate-300 leading-normal font-medium">
                  Settle prepaid mobile recharges across all national operators instantly. All transactions are routed through NPCI secure switches.
                </span>
              </div>
              <span className="shrink-0 text-[8.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 animate-pulse">
                ASL Core Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Registered Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">+91</span>
                  <input 
                    type="text"
                    maxLength={10}
                    placeholder="e.g. 9812603346"
                    value={mobileNo}
                    onChange={(e) => setMobileNo(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-11 pr-3 py-2.5 text-xs text-slate-200 font-bold outline-none focus:border-violet-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Network Operator</label>
                <select 
                  value={mobileOperator} 
                  onChange={(e) => setMobileOperator(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-semibold outline-none focus:border-violet-500 cursor-pointer"
                >
                  <option value="Jio" className="bg-slate-900">Reliance Jio</option>
                  <option value="Airtel" className="bg-slate-900">Bharti Airtel</option>
                  <option value="Vi" className="bg-slate-900">Vodafone Idea (Vi)</option>
                  <option value="BSNL" className="bg-slate-900">BSNL Mobile</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Telecom Circle</label>
                <select 
                  value={mobileCircle} 
                  onChange={(e) => setMobileCircle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-semibold outline-none focus:border-violet-500 cursor-pointer"
                >
                  <option value="Delhi NCR" className="bg-slate-900">Delhi NCR</option>
                  <option value="Mumbai" className="bg-slate-900">Mumbai</option>
                  <option value="Maharashtra" className="bg-slate-900">Maharashtra & Goa</option>
                  <option value="Karnataka" className="bg-slate-900">Karnataka</option>
                  <option value="Punjab" className="bg-slate-900">Punjab</option>
                  <option value="Haryana" className="bg-slate-900">Haryana</option>
                  <option value="Uttar Pradesh" className="bg-slate-900">Uttar Pradesh</option>
                  <option value="Andhra Pradesh" className="bg-slate-900">Andhra Pradesh</option>
                  <option value="Tamil Nadu" className="bg-slate-900">Tamil Nadu</option>
                  <option value="West Bengal" className="bg-slate-900">West Bengal</option>
                </select>
              </div>

              <div>
                <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Recharge Amount (₹)</label>
                <input 
                  type="number"
                  placeholder="239"
                  value={mobileAmount}
                  onChange={(e) => setMobileAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-bold outline-none focus:border-violet-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-2">Select Best Recommended Plan</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { amt: '239', desc: '1.5 GB/Day | 28 Days', badge: 'Popular' },
                  { amt: '299', desc: '2.0 GB/Day | 28 Days', badge: 'Best Value' },
                  { amt: '666', desc: '1.5 GB/Day | 84 Days', badge: 'Super Saver' },
                  { amt: '719', desc: '2.0 GB/Day | 84 Days', badge: 'Best Seller' },
                  { amt: '155', desc: '1 GB Total | 24 Days', badge: 'Budget' },
                  { amt: '1799', desc: '24 GB Total | 365 Days', badge: 'Annual' }
                ].map((plan) => {
                  const isSel = mobileAmount === plan.amt;
                  return (
                    <button
                      key={plan.amt}
                      type="button"
                      onClick={() => setMobileAmount(plan.amt)}
                      className={cn(
                        "p-3 rounded-xl border text-left transition duration-200 flex flex-col justify-between min-h-[78px] relative overflow-hidden cursor-pointer",
                        isSel 
                          ? "bg-violet-950/20 border-violet-500 text-slate-100" 
                          : "bg-slate-950 border-slate-850 hover:border-slate-800 text-slate-400"
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-black text-slate-100 font-mono">₹{plan.amt}</span>
                        <span className={cn(
                          "text-[7px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider",
                          isSel ? "bg-violet-500 text-white" : "bg-slate-800 text-slate-300"
                        )}>{plan.badge}</span>
                      </div>
                      <span className="text-[8px] text-slate-400 font-medium mt-1 leading-normal">{plan.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {mobileNo.length === 10 && mobileAmount && !fetchedBill && (
              <button
                type="button"
                onClick={handleFetchService}
                disabled={fetching}
                className="w-full bg-slate-100 hover:bg-white text-slate-950 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition disabled:opacity-70 mt-2 cursor-pointer"
              >
                {fetching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Retrieving Mobile Tariff Status...
                  </>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4 text-violet-400 animate-pulse" /> Fetch Operator Tariff
                  </>
                )}
              </button>
            )}

            {renderBillBlock()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Common Bill Receipt renderer
  function renderBillBlock() {
    return (
      <AnimatePresence>
        {fetchedBill && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mt-4 bg-slate-950 border border-slate-850 rounded-2xl p-4 shadow-xl"
          >
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-850 border-dashed">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-200">Payment Clearance Verified</span>
            </div>
            
            <div className="space-y-2.5 mb-5 text-xs font-medium">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Beneficiary / Holder</span>
                <span className="font-bold text-slate-300 truncate max-w-[170px]">{fetchedBill.name}</span>
              </div>
              {fetchedBill.billDate && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Bill Date</span>
                  <span className="font-bold text-slate-300">{fetchedBill.billDate}</span>
                </div>
              )}
              {fetchedBill.dueDate && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Settlement Due Date</span>
                  <span className="font-bold text-slate-300">{fetchedBill.dueDate}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-2 border-t border-slate-850">
                <span className="text-slate-500 uppercase tracking-wider text-[8px] font-black">Secure Transfer Dues</span>
                <span className="font-black text-indigo-400 text-lg">
                  {formatCurrency(Number(fetchedBill.amount))}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onProceed(fetchedBill.amount, fetchedBill.details);
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition cursor-pointer shadow-lg hover:shadow-indigo-500/15"
            >
              Securely Proceed to Pay <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
}
