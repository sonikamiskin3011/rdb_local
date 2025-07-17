import os
from functools import partial

from threading import Thread, Event, RLock
import datetime as dt


class ThreadContext:
    def __init__(self):
        self.events = {}
        self.shares = {}
        self.workers = {}

    def set_up(self, n, share_val, func, arguments):
        self.events[n + "_stop"] = Event()

        self.workers[n] = Worker(self.events[n + "_stop"],
                                 routine_interval=share_val,
                                 function=func,
                                 args=arguments)

        self.shares[n] = ShareValue()
        self.shares[n].change(share_val)
        self.workers[n].set_shared_resources(self.shares[n])
        self.workers[n].set_default_check_interval()
        self.workers[n].start()

    def exists(self, n):
        return n in self.workers

    def close(self, n):
        if not n+"_stop" in self.events or self.events[n + "_stop"].is_set():
            # to avoid of double join, return here
            return

        if self.is_live(n):
            self.events[n + "_stop"].set()
            self.workers[n].join()
            print(self.workers[n].name + " joined")

    def change_shared(self, n, value):
        self.shares[n].change(value)
        self.workers[n].is_shared_changed()

    def is_share_changed(self, n, value):
        return self.shares[n].get_share() != value

    def is_live(self, n):
        live = self.workers[n].is_alive()
        print("Is live", live)

        return self.workers[n].is_alive()


class Worker(Thread):
    """
    The class to repeat routine with passed arguments after a predefined time in separate thread;
    Will listen on stop event after which will exit the main waiting cycle;
    Will share variable to support manual input updates;
    """

    def __init__(self, stop,
                 routine_interval,
                 function, args=[], kwargs={}):
        Thread.__init__(self)

        # public
        self.share = None
        self.routine_interval = routine_interval
        self.routine = partial(function, *args, **kwargs)
        self.routine() # Run routine function at the start
        self.last_update = dt.datetime.now()

        # private
        self._stopped = stop

        self._check_interval = 3

    def set_shared_resources(self, share):
        self.share = share

    # considered UI controlled value
    @property
    def routine_interval(self):
        return self.__routine_interval

    @routine_interval.setter
    def routine_interval(self, v):
        v = abs(v)
        if v < 1:
            self.__routine_interval = 1
        else:
            self.__routine_interval = v

    def check_cache_interval(self):
        if self.last_update is None:
            self.last_update = dt.datetime.now()

        n = dt.datetime.now()
        return (n - self.last_update) / dt.timedelta(days=1) >= self.routine_interval

    def is_shared_changed(self):
        if not (self.share is None):
            v = self.share.get_share()

        changed = (v != self.routine_interval)
        if changed:
            self.routine_interval = v

        return changed

    def set_default_check_interval(self):
        self._check_interval = 3

    def run(self):
        print(self.name + " ready to run as a background process")

        while not self._stopped.wait(self._check_interval):

            if self.is_shared_changed():
                self.last_update = dt.datetime.now()

            run_routine = self.check_cache_interval()

            # lets run routine under action flag
            if run_routine:
                self.routine()
                self.last_update = dt.datetime.now()

            # exit if any requested
            if self._stopped.wait(0.01):
                print("Exiting worker thread!")
                break


class ShareValue:
    """
    The class for sharing resources with rlock;
    Any thread have read/write access over instance;
    Note that read will make a copy of internal resources those it will block as long as change is in progress;
    """

    _rlock = RLock()

    def __init__(self):
        self.value = None

    def change(self, v):
        with ShareValue._rlock:
            self.value = v

    def get_share(self):
        with ShareValue._rlock:
            v = self.value
        return v
