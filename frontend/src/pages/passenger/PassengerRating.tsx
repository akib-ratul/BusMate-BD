import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Star, Bus, MessageSquare, CheckCircle, Loader } from 'lucide-react';
import api from '../../api';

const PassengerRating = () => {
  const [selectedBus, setSelectedBus] = useState('');
  const [stars, setStars] = useState(0);
  const [hoverStars, setHoverStars] = useState(0);
  const [review, setReview] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  const { data: buses, isLoading } = useQuery({
    queryKey: ['active-buses-rating'],
    queryFn: async () => {
      const res = await api.get('/api/buses');
      return res.data.data;
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { busId: string, stars: number, review: string }) => {
      const res = await api.post('/api/ratings', data);
      return res.data;
    },
    onSuccess: () => {
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        setSelectedBus('');
        setStars(0);
        setReview('');
      }, 3000);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBus && stars > 0) {
      submitMutation.mutate({ busId: selectedBus, stars, review });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rate Your Journey</h1>
        <p className="text-gray-500 mt-1">Your feedback helps improve the Dhaka transport network.</p>
      </div>

      <div className="card p-6 md:p-8">
        {successMsg ? (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-300">
            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Review Submitted!</h3>
            <p className="text-gray-500 mt-2">Thank you for sharing your experience.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Bus Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Which bus did you travel on?</label>
              <div className="relative">
                <Bus className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select 
                  className="input pl-11 py-4 text-base font-medium shadow-sm bg-gray-50 border-gray-200"
                  value={selectedBus}
                  onChange={(e) => setSelectedBus(e.target.value)}
                  required
                >
                  <option value="" disabled>Select a bus...</option>
                  {buses?.map((bus: any) => (
                    <option key={bus.id} value={bus.id}>
                      {bus.name} ({bus.busNumber}) {bus.route ? `- ${bus.route.name}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              {isLoading && <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><Loader className="h-3 w-3 animate-spin"/> Loading buses...</p>}
            </div>

            {/* Star Rating */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Rate your experience</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="focus:outline-none transition-transform hover:scale-110"
                    onMouseEnter={() => setHoverStars(star)}
                    onMouseLeave={() => setHoverStars(0)}
                    onClick={() => setStars(star)}
                  >
                    <Star 
                      className={`h-12 w-12 ${
                        (hoverStars || stars) >= star 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300'
                      } transition-colors`} 
                    />
                  </button>
                ))}
                <span className="ml-4 text-gray-400 font-medium text-sm">
                  {stars === 0 ? 'Select a rating' : 
                   stars === 1 ? 'Terrible' : 
                   stars === 2 ? 'Poor' : 
                   stars === 3 ? 'Average' : 
                   stars === 4 ? 'Good' : 'Excellent!'}
                </span>
              </div>
            </div>

            {/* Written Review */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Leave a review (Optional)</label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <textarea 
                  className="input pl-11 py-3 bg-gray-50 border-gray-200 min-h-[120px] resize-y"
                  placeholder="Tell us what you liked or how we can improve..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                ></textarea>
              </div>
            </div>

            <button 
              type="submit"
              disabled={!selectedBus || stars === 0 || submitMutation.isPending}
              className="w-full btn btn-primary py-4 text-lg shadow-lg hover:-translate-y-0.5 transition-transform disabled:transform-none disabled:opacity-50"
            >
              {submitMutation.isPending ? <Loader className="h-5 w-5 animate-spin mx-auto" /> : 'Submit Rating'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PassengerRating;
